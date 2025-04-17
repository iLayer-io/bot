import { Options } from '@layerzerolabs/lz-v2-utilities'
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AbiCoder, ethers } from 'ethers';
import { OrderHubABI } from './abi/order-hub.abi';
import { OrderSpokeABI } from './abi/order-spoke.abi';
import { CreateOrderDto, FillOrderDto, LzReceiveDto, OrderRequestDto, OriginDto, WithdrawOrderDto } from '../dto/contracts.dto';
import {
    concat,
    keccak256,
    Contract,
    ContractTransactionResponse,
    solidityPacked,
    Wallet
} from 'ethers';
import { pad32 } from 'src/utils/utils';
import { PrismaService } from 'src/prisma/prisma.service';
const ERC20ABI = require('erc-20-abi');

@Injectable()
export class ContractsService {
    private provider: ethers.JsonRpcProvider;

    private orderHubContracts: Map<string, ethers.Contract>;
    private orderSpokeContracts: Map<string, ethers.Contract>;

    private wallet: Wallet;

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService
    ) {
        const rpcUrl = this.configService.get<string>('RPC_URL');
        if (!rpcUrl) throw new Error('Missing RPC_URL');

        const privateKey = this.configService.get<string>('USER_PRIVATE_KEY');
        if (!privateKey) throw new Error('Missing USER_PRIVATE_KEY');

        const provider = new ethers.JsonRpcProvider(rpcUrl);

        this.wallet = new Wallet(privateKey, provider);

        this.provider = provider;

        this.orderHubContracts = new Map();
        this.orderSpokeContracts = new Map();

        const chains = this.configService.get<any[]>('chains') ?? [];

        for (const chain of chains) {
            if (chain.order_hub_contract_address) {
                const contract = new Contract(
                    chain.order_hub_contract_address,
                    OrderHubABI,
                    this.provider
                );
                this.orderHubContracts.set(chain.name, contract);
            }

            if (chain.order_spoke_contract_address) {
                const contract = new Contract(
                    chain.order_spoke_contract_address,
                    OrderSpokeABI,
                    this.provider
                );
                this.orderSpokeContracts.set(chain.name, contract);
            }
        }
    }

    async testConnection() {
        return await this.provider.getBlockNumber();
    }

    async getAllOrders() {
        return this.prisma.order.findMany({
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
    }

    private async signOrder({
        request,
        orderHub
    }: {
        request: OrderRequestDto;
        orderHub: Contract;
    }): Promise<`0x${string}`> {
        const domainSeparator: `0x${string}` = await orderHub.domainSeparator();
        const hashedRequest: `0x${string}` = await orderHub.hashOrderRequest(request);

        const data = concat(["0x1901", domainSeparator, hashedRequest]);
        const { r, s, v } = this.wallet.signingKey.sign(keccak256(data) as `0x${string}`);

        return solidityPacked(
            ['bytes32', 'bytes32', 'uint8'],
            [r, s, v]
        ) as `0x${string}`;
    }

    async createOrder(dto: CreateOrderDto, chainName: string): Promise<ContractTransactionResponse> {
        const orderHub = this.orderHubContracts.get(chainName);
        if (!orderHub)
            return Promise.reject(new Error(`No order hub contract found for chain ${chainName}`));

        const inputTokenAddress = dto.request.order.inputs[0].tokenAddress
        const erc20InputToken = new Contract(inputTokenAddress, ERC20ABI, this.provider);

        const owner = dto.request.order.user;
        const spender = orderHub.target;
        const amount = BigInt(dto.request.order.inputs[0].amount);

        const allowance: bigint = await (erc20InputToken.connect(this.wallet) as any).allowance(owner, spender);
        console.log('Allowance:', allowance.toString());
        if (allowance < amount) {
            const tx = await (erc20InputToken.connect(this.wallet) as any).approve(spender, amount);
            await tx.wait();
        }
        const newAllowance: bigint = await (erc20InputToken.connect(this.wallet) as any).allowance(owner, spender);
        console.log('Allowance updated: new allowance:', newAllowance.toString());


        const deadlineFillerGap = 300;
        const latestBlock = await this.provider.getBlock('latest');
        const timestamp = latestBlock!.timestamp;
        const deadline = timestamp + 2 * deadlineFillerGap;
        const primaryFillerDeadline = timestamp + deadlineFillerGap;

        dto.request.order.user = pad32(dto.request.order.user as `0x${string}`);
        dto.request.order.filler = pad32(dto.request.order.filler as `0x${string}`);
        dto.request.order.inputs[0].tokenAddress = pad32(dto.request.order.inputs[0].tokenAddress as `0x${string}`);
        dto.request.order.outputs[0].tokenAddress = pad32(dto.request.order.outputs[0].tokenAddress as `0x${string}`);
        dto.request.order.callRecipient = pad32(dto.request.order.callRecipient as `0x${string}`);

        dto.request.deadline = deadline;
        dto.request.order.primaryFillerDeadline = primaryFillerDeadline;
        dto.request.order.deadline = deadline;

        const options = Options.newOptions().addExecutorLzReceiveOption(50000, 0);
        dto.options = options.toHex();

        dto.signature = await this.signOrder({
            request: dto.request,
            orderHub: orderHub
        });
        console.log('Signature:', dto.signature);

        // const endpoint = await orderHub.endpoint();
        // console.log('Endpoint:', endpoint);

        const nativeFee = await orderHub.estimateBridgingFee(
            dto.request.order.destinationChainEid,
            dto.request.order.callData, // the serialized payload sent to the target chain
            dto.options
        );

        console.log('Native Fee:', nativeFee.toString());

        console.log('New DTO:', dto);

        const orderId = await orderHub.getOrderId(
            dto.request.order,
            dto.request.nonce
        );
        console.log('Order ID:', orderId);

        const timeBuffer = await orderHub.timeBuffer();
        console.log('Time Buffer:', timeBuffer.toString());

        const status = await orderHub.orders(orderId);
        console.log('Order Status:', status);
        try {
            const tx = await (orderHub.connect(this.wallet) as any).createOrder(
                dto.request,
                dto.permits,
                dto.signature,
                dto.options,
                {
                    value: nativeFee * 110n / 100n,
                }
            );

            const receipt = await tx.wait();

            await this.prisma.order.create({
                data: {
                    orderId: orderId,
                    chain: chainName,
                    signature: dto.signature,
                    options: dto.options,
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

        // Pad necessary fields
        dto.order.user = pad32(dto.order.user as `0x${string}`);
        dto.order.filler = pad32(dto.order.filler as `0x${string}`);
        dto.order.callRecipient = pad32(dto.order.callRecipient as `0x${string}`);
        dto.order.recipient = pad32(dto.order.recipient as `0x${string}`);
        dto.order.inputs.forEach(t => t.tokenAddress = pad32(t.tokenAddress as `0x${string}`));
        dto.order.outputs.forEach(t => t.tokenAddress = pad32(t.tokenAddress as `0x${string}`));

        console.log('New DTO:', JSON.stringify(dto, null, 2));
        const orderId = await orderHub.getOrderId(
            dto.order,
            dto.orderNonce
        );
        console.log('Order ID:', orderId);

        const timeBuffer = await orderHub.timeBuffer();
        console.log('Time Buffer:', timeBuffer.toString());

        const latestBlock = await this.provider.getBlock('latest');
        const timestamp = latestBlock!.timestamp;
        console.log('Current Timestamp:', timestamp.toString());

        const deadline = dto.order.deadline;
        console.log('Order Deadline:', deadline.toString());

        const status = await orderHub.orders(orderId);
        console.log('Order Status:', status);

        const tx = await (orderHub.connect(this.wallet) as any).withdrawOrder(
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

        const orderHub = this.orderHubContracts.get(chainName);
        if (!orderHub) throw new Error(`No order hub contract found for chain ${chainName}`);
        // Pad values if needed
        dto.order.user = pad32(dto.order.user as `0x${string}`);
        dto.order.filler = pad32(dto.order.filler as `0x${string}`);
        dto.order.callRecipient = pad32(dto.order.callRecipient as `0x${string}`);
        dto.order.inputs.forEach(t => t.tokenAddress = pad32(t.tokenAddress as `0x${string}`));
        dto.order.outputs.forEach(t => t.tokenAddress = pad32(t.tokenAddress as `0x${string}`));

        const options = Options.newOptions().addExecutorLzReceiveOption(50000, 0);
        dto.options = options.toHex();

        // Estimate fee
        const nativeFee = await orderSpoke.estimateBridgingFee(
            dto.order.destinationChainEid,
            dto.order.callData,
            dto.options
        );

        const adjustedFee = nativeFee * 110n / 100n; // +10% buffer

        console.log('New DTO:', JSON.stringify(dto, null, 2));
        const orderId = await orderHub.getOrderId(
            dto.order,
            dto.orderNonce
        );
        console.log('Order ID:', orderId);

        const timeBuffer = await orderHub.timeBuffer();
        console.log('Time Buffer:', timeBuffer.toString());

        const status = await orderHub.orders(orderId);
        console.log('Order Status:', status);
        const tx = await (orderSpoke.connect(this.wallet) as any).fillOrder(
            dto.order,
            dto.orderNonce,
            pad32(dto.fundingWallet as `0x${string}`),
            dto.maxGas,
            dto.options,
            {
                value: adjustedFee
            }
        );

        return await tx.wait();
    }

    async lzReceive(
        dto: CreateOrderDto,
        chain: string
    ): Promise<ContractTransactionResponse> {
        const orderHub = this.orderHubContracts.get(chain);
        if (!orderHub) throw new Error(`No order hub contract found for chain ${chain}`);

        const originDto: OriginDto = {
            srcEid: dto.request.order.destinationChainEid,
            nonce: dto.request.nonce.toString(),
            sender: dto.request.order.user
        }

        const orderType = "tuple(bytes32, bytes32, bytes32, (uint8, bytes32, uint256, uint256)[], (uint8, bytes32, uint256, uint256)[], uint32, uint32, bool, uint64, uint64, bytes32, bytes, uint256)";
        const encodedOrder = [
            pad32(dto.request.order.user as `0x${string}`),
            pad32(dto.request.order.recipient as `0x${string}`),
            pad32(dto.request.order.filler as `0x${string}`),
            dto.request.order.inputs.map(token => [
                token.tokenType,
                pad32(token.tokenAddress as `0x${string}`),
                token.tokenId,
                token.amount,
            ]),
            dto.request.order.outputs.map(token => [
                token.tokenType,
                pad32(token.tokenAddress as `0x${string}`),
                token.tokenId,
                token.amount,
            ]),
            dto.request.order.sourceChainEid,
            dto.request.order.destinationChainEid,
            dto.request.order.sponsored,
            dto.request.order.primaryFillerDeadline,
            dto.request.order.deadline,
            pad32(dto.request.order.callRecipient as `0x${string}`),
            dto.request.order.callData, // assume it's already a hex string
            dto.request.order.callValue
        ];

        const payload = AbiCoder.defaultAbiCoder().encode(
            [orderType, "uint64", "bytes32"],
            [encodedOrder, dto.request.nonce, pad32(dto.request.order.user as `0x${string}`)]
        );

        console.log('Payload:', payload);
        const orderId = await orderHub.getOrderId(
            dto.request.order,
            dto.request.nonce
        );
        const lzReceiveDto: LzReceiveDto = {
            guid: orderId,
            message: payload,
            executor: dto.request.order.filler,
            extraData: dto.request.order.callData,
            origin: originDto
        };
        console.log('LzReceive DTO:', lzReceiveDto);
        const lzReceiveTx = await (orderHub.connect(this.wallet) as any).lzReceive(
            lzReceiveDto.origin,
            lzReceiveDto.guid,
            lzReceiveDto.message,
            lzReceiveDto.executor,
            lzReceiveDto.extraData,
            {
                value: BigInt(0) // adjust if it ever requires a fee
            }
        );
        const lzReceiveReceipt = await lzReceiveTx.wait();
        console.log('lzReceive Receipt:', lzReceiveReceipt);
        return lzReceiveReceipt;
    }
}
