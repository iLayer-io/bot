import { Options } from '@layerzerolabs/lz-v2-utilities'
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, getAddress, parseUnits } from 'ethers';
import { OrderHubABI } from './abi/order-hub.abi';
import { OrderSpokeABI } from './abi/order-spoke.abi';
import { CreateOrderDto, CreateOrderRequestDto, FillOrderDto, TokenIORequestDto, OrderRequestDto, WithdrawOrderDto } from '../dto/contracts.dto';
import {
    concat,
    keccak256,
    Contract,
    ContractTransactionResponse,
    Interface,
    solidityPacked,
    Wallet
} from 'ethers';
import { pad32 } from 'src/utils/utils';
import { PrismaService } from 'src/prisma/prisma.service';

const ERC20ABI = require('erc-20-abi');
const OrderStatusMap = {
    0: 'NULL',
    1: 'ACTIVE',
    2: 'FILLED',
    3: 'WITHDRAWN'
} as const;
const NATIVE_TOKEN = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

type OrderStatusLabel = typeof OrderStatusMap[keyof typeof OrderStatusMap];

@Injectable()
export class ContractsService {

    private orderHubContracts: Map<string, ethers.Contract>;
    private orderSpokeContracts: Map<string, ethers.Contract>;
    private providers: Map<string, ethers.JsonRpcProvider>;
    private wallets: Map<string, Wallet>;

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService
    ) {
        this.orderHubContracts = new Map();
        this.orderSpokeContracts = new Map();
        this.providers = new Map();
        this.wallets = new Map();

        const chains = this.configService.get<any[]>('chains') ?? [];

        for (const chain of chains) {
            const rpcUrl = this.configService.get<string>(chain.rpc_url_environment_variable);
            if (!rpcUrl) throw new Error(`Missing RPC_URL for chain ${chain.name}`);

            const privateKey = this.configService.get<string>(chain.private_key_environment_variable);
            if (!privateKey) throw new Error('Missing PRIVATE_KEY for chain ' + chain.name);

            const provider = new ethers.JsonRpcProvider(rpcUrl);
            this.providers.set(chain.name, provider);
            const wallet = new Wallet(privateKey, provider);
            this.wallets.set(chain.name, wallet);

            if (chain.order_hub_contract_address) {
                const contract = new Contract(
                    chain.order_hub_contract_address,
                    OrderHubABI,
                    provider
                );
                this.orderHubContracts.set(chain.name, contract);
            }

            if (chain.order_spoke_contract_address) {
                const contract = new Contract(
                    chain.order_spoke_contract_address,
                    OrderSpokeABI,
                    provider
                );
                this.orderSpokeContracts.set(chain.name, contract);
            }
        }
    }

    async getAllOrders() {
        const rawOrders = await this.prisma.order.findMany({
            include: {
                request: {
                    include: {
                        order: {
                            include: {
                                inputs: true,
                                outputs: true,
                            },
                        },
                    },
                },
            },
        });

        return this.stringifyBigInts(rawOrders);
    }


    private async signOrder({
        chainName,
        request,
        orderHub
    }: {
        chainName: string;
        request: OrderRequestDto;
        orderHub: Contract;
    }): Promise<`0x${string}`> {
        const domainSeparator: `0x${string}` = await orderHub.domainSeparator();
        const hashedRequest: `0x${string}` = await orderHub.hashOrderRequest(request);
        const wallet = this.wallets.get(chainName);
        if (!wallet) throw new Error(`No wallet found for chain ${chainName}`);

        const data = concat(["0x1901", domainSeparator, hashedRequest]);
        const { r, s, v } = wallet.signingKey.sign(keccak256(data) as `0x${string}`);

        return solidityPacked(
            ['bytes32', 'bytes32', 'uint8'],
            [r, s, v]
        ) as `0x${string}`;
    }

    async createOrderRequest(dto: CreateOrderRequestDto): Promise<ContractTransactionResponse> {
        const chains = this.configService.get('chains');
        const sourceChainConfig = chains.find(c => c.name === dto.sourceChain);
        const destChainConfig = chains.find(c => c.name === dto.destinationChain);

        if (!sourceChainConfig || !destChainConfig) {
            throw new Error(`Chain config not found for source: ${dto.sourceChain} or destination: ${dto.destinationChain}`);
        }

        const resolveTokenAddress = (symbol: string, chainConfig: any): string => {
            const token = chainConfig.tokens.find(t => t.symbol === symbol);
            if (!token) {
                throw new Error(`Token ${symbol} not found in chain ${chainConfig.name}`);
            }
            return token.address;
        };

        const mapToken = (tokenDto: TokenIORequestDto, chainConfig: any) => ({
            tokenType: 2, // ERC20
            tokenAddress: resolveTokenAddress(tokenDto.token, chainConfig),
            tokenId: 0,
            amount: tokenDto.amount,
        });

        const createOrderDto: CreateOrderDto = {
            request: {
                nonce: 0, // will be set later
                deadline: 0, // will be set later
                order: {
                    user: dto.user,
                    recipient: dto.recipient,
                    filler: dto.filler,
                    sourceChainEid: sourceChainConfig.chain_eid,
                    destinationChainEid: destChainConfig.chain_eid,
                    sponsored: false,
                    primaryFillerDeadline: 0, // will be set later
                    deadline: 0, // will be set later
                    callRecipient: dto.recipient,
                    callData: '0x',
                    callValue: 0,
                    inputs: dto.inputs.map(input => mapToken(input, sourceChainConfig)),
                    outputs: dto.outputs.map(output => mapToken(output, destChainConfig)),
                },
            },
            permits: new Array(dto.inputs.length).fill("0x"),
            signature: '',
            options: '',
        };

        console.log('Create Order DTO:', JSON.stringify(createOrderDto, null, 2));

        return this.createOrder(createOrderDto, dto.sourceChain);
    }

    async fillOrderFromDb(nonce: number, chainName: string): Promise<void> {
        const allOrders = await this.getAllOrders();

        for (const r of allOrders) {
            if (!r.request) {
                console.warn('Missing request for:', r.id);
                continue;
            }
            if (r.request.nonce === 26) {
                console.log('FOUND IT:', r);
            }
        }

        const orderRecord = allOrders.find(
            (record) => record.request?.nonce === nonce
        );

        if (!orderRecord) throw new Error(`Order with nonce ${nonce} not found`);

        const dto = new FillOrderDto();
        dto.order = orderRecord.request.order;
        dto.orderNonce = nonce;
        dto.fundingWallet = orderRecord.request.order.filler; // as discussed
        dto.maxGas = 5_000_000; // you can customize this if you store it somewhere
        dto.options = orderRecord.options;

        await this.fillOrder(dto, chainName);
    }

    async withdrawOrderFromDb(nonce: number, chainName: string): Promise<void> {
        const allOrders = await this.getAllOrders();

        for (const r of allOrders) {
            if (!r.request) {
                console.warn('Missing request for:', r.id);
                continue;
            }
            if (r.request.nonce === 26) {
                console.log('FOUND IT:', r);
            }
        }

        const orderRecord = allOrders.find(
            (record) => record.request?.nonce === nonce
        );

        if (!orderRecord) throw new Error(`Order with nonce ${nonce} not found`);

        const dto = new WithdrawOrderDto();
        dto.order = orderRecord.request.order;
        dto.orderNonce = nonce;

        await this.withdrawOrder(dto, chainName);
    }

    async orderHubStatusFromDb(nonce: number, chainName: string): Promise<{ status: OrderStatusLabel; raw: any }> {
        const allOrders = await this.getAllOrders();
        const orderRecord = allOrders.find(
            (record) => record.request?.nonce === nonce
        );
        if (!orderRecord) throw new Error(`Order with nonce ${nonce} not found`);
        const orderId = orderRecord.orderId;
        return this.getOrderHubStatus(orderId, chainName);
    }

    // SAME FOR orderSpoke
    async orderSpokeStatusFromDb(nonce: number, chainName: string): Promise<{ status: OrderStatusLabel; raw: any }> {
        const allOrders = await this.getAllOrders();
        const orderRecord = allOrders.find(
            (record) => record.request?.nonce === nonce
        );
        if (!orderRecord) throw new Error(`Order with nonce ${nonce} not found`);
        const orderId = orderRecord.orderId;
        return this.getOrderSpokeStatus(orderId, chainName);
    }

    async createOrder(dto: CreateOrderDto, chainName: string): Promise<ContractTransactionResponse> {
        const orderHub = this.orderHubContracts.get(chainName);
        if (!orderHub)
            return Promise.reject(new Error(`No order hub contract found for chain ${chainName}`));
        const provider = this.providers.get(chainName);
        if (!provider)
            return Promise.reject(new Error(`No provider found for chain ${chainName}`));
        const wallet = this.wallets.get(chainName);
        if (!wallet)
            return Promise.reject(new Error(`No wallet found for chain ${chainName}`));

        const inputTokenAddress = dto.request.order.inputs[0].tokenAddress
        const erc20InputToken = new Contract(inputTokenAddress, ERC20ABI, provider);

        const owner = dto.request.order.user;
        const spender = orderHub.target;
        const amount = BigInt(dto.request.order.inputs[0].amount);

        const allowance: bigint = await (erc20InputToken.connect(wallet) as any).allowance(owner, spender);
        if (allowance < amount) {
            const tx = await (erc20InputToken.connect(wallet) as any).approve(spender, amount);
            await tx.wait();
        }

        const deadlineFillerGap = 3600;
        const latestBlock = await provider.getBlock('latest');
        const timestamp = latestBlock!.timestamp;
        const deadline = timestamp + 3 * deadlineFillerGap;
        const primaryFillerDeadline = timestamp + 2 * deadlineFillerGap;

        dto.request.order.user = pad32(dto.request.order.user as `0x${string}`);
        dto.request.order.filler = pad32(dto.request.order.filler as `0x${string}`);
        dto.request.order.inputs[0].tokenAddress = pad32(dto.request.order.inputs[0].tokenAddress as `0x${string}`);
        dto.request.order.outputs[0].tokenAddress = pad32(dto.request.order.outputs[0].tokenAddress as `0x${string}`);
        dto.request.order.callRecipient = pad32(dto.request.order.callRecipient as `0x${string}`);

        dto.request.deadline = deadline;
        dto.request.order.primaryFillerDeadline = primaryFillerDeadline;
        dto.request.order.deadline = deadline;

        const options = Options.newOptions().addExecutorLzReceiveOption(1e5, 0);
        dto.options = options.toHex();

        const orderNonce = await orderHub.nonce();
        const orderId = await orderHub.getOrderId(
            dto.request.order,
            orderNonce + 1n
        );

        dto.request.nonce = Number(orderNonce + 1n);

        dto.signature = await this.signOrder({
            chainName: chainName,
            request: dto.request,
            orderHub: orderHub
        });

        const nativeFee = await orderHub.estimateBridgingFee(
            dto.request.order.destinationChainEid,
            dto.request.order.callData,
            dto.options
        );

        try {
            const tx = await (orderHub.connect(wallet) as any).createOrder(
                dto.request,
                dto.permits,
                dto.signature,
                dto.options,
                {
                    value: nativeFee * 110n / 100n,
                }
            );

            await this.saveOrderToDb(orderId, chainName, dto, dto.signature, dto.options);

            const receipt = await tx.wait();

            console.log('Order created in DB:', receipt);
            return receipt;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    async withdrawOrder(
        dto: WithdrawOrderDto,
        chainName: string
    ): Promise<ContractTransactionResponse> {
        const orderHub = this.orderHubContracts.get(chainName);
        if (!orderHub) throw new Error(`No order hub contract found for chain ${chainName}`);
        const provider = this.providers.get(chainName);
        if (!provider)
            return Promise.reject(new Error(`No provider found for chain ${chainName}`));
        const wallet = this.wallets.get(chainName);
        if (!wallet)
            return Promise.reject(new Error(`No wallet found for chain ${chainName}`));

        // Pad necessary fields
        dto.order.user = pad32(dto.order.user as `0x${string}`);
        dto.order.filler = pad32(dto.order.filler as `0x${string}`);
        dto.order.callRecipient = pad32(dto.order.callRecipient as `0x${string}`);
        dto.order.recipient = pad32(dto.order.recipient as `0x${string}`);
        dto.order.inputs.forEach(t => t.tokenAddress = pad32(t.tokenAddress as `0x${string}`));
        dto.order.outputs.forEach(t => t.tokenAddress = pad32(t.tokenAddress as `0x${string}`));

        const tx = await (orderHub.connect(wallet) as any).withdrawOrder(
            dto.order,
            dto.orderNonce
        );

        return await tx.wait();
    }

    async fillOrder(
        dto: FillOrderDto,
        chainName: string
    ): Promise<ContractTransactionResponse> {
        const orderSpoke = this.orderSpokeContracts.get(chainName);
        if (!orderSpoke) throw new Error(`No order spoke contract found for chain ${chainName}`);
        const provider = this.providers.get(chainName);
        if (!provider)
            return Promise.reject(new Error(`No provider found for chain ${chainName}`));
        const wallet = this.wallets.get(chainName);
        if (!wallet)
            return Promise.reject(new Error(`No wallet found for chain ${chainName}`));

        const options = Options.newOptions().addExecutorLzReceiveOption(1e5, 0);
        dto.options = options.toHex();

        // Estimate fee
        const nativeFee = await orderSpoke.estimateBridgingFee(
            dto.order.sourceChainEid,
            dto.order.callData,
            dto.options
        );

        const adjustedFee = nativeFee * 110n / 100n; // +10% buffer

        const owner = dto.order.user;
        const ownerAddress = '0x' + owner.slice(-40); // Last 20 bytes = 40 hex chars
        const checksummedOwner = getAddress(ownerAddress);
        const outputTokenAddress = dto.order.outputs[0].tokenAddress
        const actual = getAddress('0x' + outputTokenAddress.slice(-40));
        const erc20OutputToken = new Contract(actual, ERC20ABI, provider);
        const spender = orderSpoke.target;
        const amount = BigInt(dto.order.outputs[0].amount);
        const allowance: bigint = await (erc20OutputToken.connect(wallet) as any).allowance(checksummedOwner, spender);
        if (allowance < amount) {
            const tx = await (erc20OutputToken.connect(wallet) as any).approve(spender, amount);
            await tx.wait();
        }

        const tx = await (orderSpoke.connect(wallet) as any).fillOrder(
            dto.order,
            dto.orderNonce,
            pad32(dto.fundingWallet as `0x${string}`),
            dto.maxGas,
            dto.options,
            {
                value: adjustedFee,
                gasLimit: 7_000_000,
                gasPrice: parseUnits('0.006', 'gwei')
            }
        );

        console.log('TX:', tx.hash);

        const receipt = await tx.wait();

        console.log('Transaction receipt', receipt);
        return receipt;
    }

    async getOrderHubStatus(
        orderId: string,
        chainName: string
    ): Promise<{ status: OrderStatusLabel; raw: any }> {
        const orderHub = this.orderHubContracts.get(chainName);
        if (!orderHub) throw new Error(`No order hub contract found for chain ${chainName}`);

        const order = await orderHub.orders(orderId);
        const statusCode = Number(order.status ?? order);

        return {
            status: OrderStatusMap[statusCode as keyof typeof OrderStatusMap] ?? 'UNKNOWN',
            raw: this.stringifyBigInts(order)
        };
    }

    async getOrderSpokeStatus(
        orderId: string,
        chainName: string
    ): Promise<{ status: OrderStatusLabel; raw: any }> {
        const orderSpoke = this.orderSpokeContracts.get(chainName);
        if (!orderSpoke) throw new Error(`No order spoke contract found for chain ${chainName}`);

        console.log("spoke", orderSpoke);
        const order = await orderSpoke.orders(orderId);
        const statusCode = Number(order.status ?? order);

        return {
            status: OrderStatusMap[statusCode as keyof typeof OrderStatusMap] ?? 'UNKNOWN',
            raw: this.stringifyBigInts(order)
        };
    }
    private stringifyBigInts(obj: any): any {
        if (typeof obj === 'bigint') {
            return obj.toString();
        }
        if (Array.isArray(obj)) {
            return obj.map(v => this.stringifyBigInts(v));
        }
        if (obj && typeof obj === 'object') {
            return Object.fromEntries(
                Object.entries(obj).map(([k, v]) => [k, this.stringifyBigInts(v)])
            );
        }
        return obj;
    }

    private async saveOrderToDb(orderId: string, chainName: string, dto: CreateOrderDto, signature: string, options: string) {
        return await this.prisma.order.create({
            data: {
                orderId,
                chain: chainName,
                signature,
                options,
                permits: dto.permits,
                request: {
                    create: {
                        deadline: dto.request.deadline,
                        nonce: dto.request.nonce,
                        order: {
                            create: {
                                user: dto.request.order.user,
                                recipient: dto.request.order.recipient,
                                filler: dto.request.order.filler,
                                sourceChainEid: dto.request.order.sourceChainEid,
                                destinationChainEid: dto.request.order.destinationChainEid,
                                sponsored: dto.request.order.sponsored,
                                primaryFillerDeadline: dto.request.order.primaryFillerDeadline,
                                deadline: dto.request.order.deadline,
                                callRecipient: dto.request.order.callRecipient,
                                callData: dto.request.order.callData,
                                callValue: dto.request.order.callValue,
                                inputs: {
                                    create: dto.request.order.inputs.map(i => ({
                                        tokenType: i.tokenType,
                                        tokenAddress: i.tokenAddress,
                                        tokenId: i.tokenId,
                                        amount: i.amount,
                                    })),
                                },
                                outputs: {
                                    create: dto.request.order.outputs.map(o => ({
                                        tokenType: o.tokenType,
                                        tokenAddress: o.tokenAddress,
                                        tokenId: o.tokenId,
                                        amount: o.amount,
                                    })),
                                },
                            },
                        },
                    },
                },
            },
        });
    }

    async listenToOrderCreated(chainName: string) {
        const orderHub = this.orderHubContracts.get(chainName);
        if (!orderHub) {
            console.error(`No OrderHub contract found for chain ${chainName}`);
            return;
        }

        const provider = this.providers.get(chainName);
        if (!provider) {
            console.error(`No provider found for chain ${chainName}`);
            return;
        }
        const latestBlock = await provider.getBlockNumber();

        const events = await orderHub.queryFilter('OrderCreated', latestBlock - 5000, latestBlock); // adjust range as needed

        for (const ev of events) {
            if (!('args' in ev)) continue;
            const orderHubInterface = new Interface(OrderHubABI);
            const decoded = orderHubInterface.decodeEventLog('OrderCreated', ev.data, ev.topics);

            const [orderId, orderNonce, orderRaw, sender] = decoded;

            // unpack nested struct
            const [
                user,
                recipient,
                inputsRaw,
                outputsRaw,
                sourceChainEid,
                destinationChainEid,
                sponsored,
                primaryFillerDeadline,
                deadline,
                callRecipient,
                callData,
                callValue,
            ] = orderRaw;

            // inputsRaw and outputsRaw are arrays of arrays, decode them
            const inputs = inputsRaw.map(([tokenType, tokenAddress, tokenId, amount]: any) => ({
                tokenType,
                tokenAddress,
                tokenId,
                amount,
            }));

            const outputs = outputsRaw.map(([tokenType, tokenAddress, tokenId, amount]: any) => ({
                tokenType,
                tokenAddress,
                tokenId,
                amount,
            }));

            const dto: CreateOrderDto = {
                request: {
                    nonce: Number(orderNonce),
                    deadline,
                    order: {
                        user: pad32(user),
                        filler: pad32(user), // if filler === user (or extract separately if different)
                        recipient: pad32(recipient),
                        callRecipient: pad32(callRecipient),
                        sourceChainEid,
                        destinationChainEid,
                        sponsored,
                        primaryFillerDeadline,
                        deadline,
                        callValue,
                        callData,
                        inputs: inputs.map(i => ({
                            ...i,
                            tokenAddress: pad32(i.tokenAddress),
                        })),
                        outputs: outputs.map(o => ({
                            ...o,
                            tokenAddress: pad32(o.tokenAddress),
                        })),
                    }
                },
                signature: '',
                options: '',
                permits: new Array(inputs.length).fill('0x'),
            };

            try {
                await this.saveOrderToDb(orderId, chainName, dto, '', '');
            } catch (err) {
                console.error(`Failed to store historical order ${orderId} from ${chainName}:`, err);
            }
        }
    }

    async getBalance(chainName: string, tokenSymbol: string): Promise<string> {
        const chains = this.configService.get<any[]>('chains') ?? [];
        const chain = chains.find(c => c.name === chainName);
        if (!chain) throw new Error(`Chain not found: ${chainName}`);

        const token = chain.tokens.find((t: any) => t.symbol === tokenSymbol);
        if (!token) throw new Error(`Token ${tokenSymbol} not found on chain ${chainName}`);

        const rpcUrl = this.configService.get<string>(chain.rpc_url_environment_variable);
        const privateKey = this.configService.get<string>(chain.private_key_environment_variable);
        if (!rpcUrl || !privateKey) throw new Error(`Missing RPC or private key for ${chainName}`);

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(privateKey, provider);

        if (token.address.toLowerCase() === NATIVE_TOKEN) {
            // Fetch native balance (ETH, BNB, BERA, etc.)
            const nativeBalance: bigint = await provider.getBalance(wallet.address);
            return nativeBalance.toString();
        }

        // Else, get the balance from the ERC20 token
        const contract = new Contract(token.address, ERC20ABI, provider);
        const balance: bigint = await contract.balanceOf(wallet.address);
        return balance.toString();
    }
}
