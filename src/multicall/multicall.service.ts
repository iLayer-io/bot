import { Options } from '@layerzerolabs/lz-v2-utilities';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getAddress, ethers, Wallet, Contract, parseUnits } from 'ethers';
import { CustomExecutorEncoder } from '../utils/CustomExecutionEncoder';
import { OrderHubABI } from '../contracts/abi/order-hub.abi';
import { OrderSpokeABI } from '../contracts/abi/order-spoke.abi';
import { ZeroxService } from '../zerox/zerox.service';
import { FillOrderDto, ZeroxSwapDto } from '../dto/contracts.dto';
import { pad32 } from 'src/utils/utils';

const ERC20ABI = require('erc-20-abi');

@Injectable()
export class MulticallService {
    private readonly executors = new Map<string, CustomExecutorEncoder>();
    private readonly wallets = new Map<string, Wallet>();
    private readonly providers = new Map<string, ethers.JsonRpcProvider>();
    private readonly orderHubs = new Map<string, Contract>();
    private readonly orderSpokes = new Map<string, Contract>();

    constructor(
        private readonly configService: ConfigService,
        private readonly zeroxService: ZeroxService
    ) {
        const chains = this.configService.get<any[]>('chains') ?? [];

        for (const chain of chains) {
            const rpcUrl = this.configService.get<string>(chain.rpc_url_environment_variable);
            const privateKey = this.configService.get<string>(chain.private_key_environment_variable);
            const executorAddress = chain.executor;

            if (!rpcUrl || !privateKey || !executorAddress) {
                throw new Error(`Missing config for chain ${chain.name}`);
            }

            const provider = new ethers.JsonRpcProvider(rpcUrl);
            const wallet = new Wallet(privateKey, provider);

            this.providers.set(chain.name, provider);
            this.wallets.set(chain.name, wallet);
            this.executors.set(chain.name, new CustomExecutorEncoder(executorAddress, wallet));

            if (chain.order_hub_contract_address) {
                this.orderHubs.set(chain.name, new Contract(chain.order_hub_contract_address, OrderHubABI, provider));
            }

            if (chain.order_spoke_contract_address) {
                this.orderSpokes.set(chain.name, new Contract(chain.order_spoke_contract_address, OrderSpokeABI, provider));
            }
        }
    }

    getExecutor(chainName: string): CustomExecutorEncoder {
        const encoder = this.executors.get(chainName);
        if (!encoder) throw new Error(`ExecutorEncoder not initialized for chain ${chainName}`);
        return encoder;
    }

    getWallet(chainName: string): Wallet {
        const wallet = this.wallets.get(chainName);
        if (!wallet) throw new Error(`Wallet not found for chain ${chainName}`);
        return wallet;
    }

    getProvider(chainName: string): ethers.JsonRpcProvider {
        const provider = this.providers.get(chainName);
        if (!provider) throw new Error(`Provider not found for chain ${chainName}`);
        return provider;
    }

    getOrderHub(chainName: string): Contract | undefined {
        return this.orderHubs.get(chainName);
    }

    getOrderSpoke(chainName: string): Contract | undefined {
        return this.orderSpokes.get(chainName);
    }

    async executeSwapAndFill(chainName: string, swapResponse: any, fillDto: FillOrderDto) {
        const encoder = this.getExecutor(chainName);
        const wallet = this.getWallet(chainName);
        const provider = this.getProvider(chainName);
        const orderSpoke = this.getOrderSpoke(chainName);

        if (!orderSpoke) throw new Error(`OrderSpoke contract not found for chain ${chainName}`);

        // Set executor options
        fillDto.options = Options.newOptions().addExecutorLzReceiveOption(1e5, 0).toHex();

        // Estimate bridging fee
        const fee = await orderSpoke.estimateBridgingFee(
            fillDto.order.sourceChainEid,
            fillDto.order.callData,
            fillDto.options
        );
        const adjustedFee = (fee * 110n) / 100n;

        // Approve token for 0x swap if needed
        const spender = swapResponse.issues?.allowance?.spender;
        const sellToken = swapResponse.sellToken;
        const sellAmount = BigInt(swapResponse.sellAmount);
        console.log("pushing approve")
        if (spender) {
            encoder.erc20Approve(sellToken, spender, sellAmount);
        }

        // Push the swap transaction
        // console.log("pushing swap")
        // console.log("swapResponse.transaction.to", swapResponse.transaction.to);
        // console.log("swapResponse.transaction.data", swapResponse.transaction.data);
        // encoder.zeroXSwap(swapResponse.transaction.to, swapResponse.transaction.data);

        // Check output token allowance for fillOrder
        const outputTokenAddress = getAddress('0x' + fillDto.order.outputs[0].tokenAddress.slice(-40));
        const outputAmount = BigInt(fillDto.order.outputs[0].amount);
        const ownerAddress = getAddress('0x' + fillDto.order.user.slice(-40));

        const outputToken = new Contract(outputTokenAddress, ERC20ABI, provider);
        const allowance: bigint = await (outputToken.connect(wallet) as any).allowance(ownerAddress, orderSpoke.target);

        if (allowance < outputAmount) {
            encoder.erc20Approve(outputTokenAddress, orderSpoke.target as `0x${string}`, outputAmount);
        }

        // Push fillOrder
        fillDto.order.recipient = pad32(fillDto.order.recipient as `0x${string}`);
        console.log("pushing fillOrder")
        console.log("orderSpoke.target", orderSpoke.target);
        console.log("fillDto", fillDto);
        console.log("adjustedFee", adjustedFee);
        encoder.fillOrder(orderSpoke.target as `0x${string}`, fillDto, adjustedFee);

        // Execute all in one multicall
        console.log("executing multicall")
        return await encoder.exec({
            gasLimit: 10_000_000,
            gasPrice: parseUnits("0.006", "gwei"),
        });
    }

    async swapAndFillUsingExecutor(swapDto: ZeroxSwapDto, fillDto: FillOrderDto): Promise<any> {
        const chains = this.configService.get('chains');
        const chain = chains.find(c => c.name === swapDto.chainName);
        if (!chain) throw new Error(`Chain ${swapDto.chainName} not found in configuration`);

        const resolveTokenAddress = (symbol: string): string => {
            const token = chain.tokens.find(t => t.symbol === symbol);
            if (!token) {
                throw new Error(`Token ${symbol} not found in config for chain ${chain.name}`);
            }
            return token.address;
        };

        const buyToken = resolveTokenAddress(swapDto.buyTokenName);
        const sellToken = resolveTokenAddress(swapDto.sellTokenName);
        const chainId = chain.chain_id;

        const swapResponse = await this.zeroxService.getQuoteAndAppendSignature({
            chainName: swapDto.chainName,
            buyToken,
            sellToken,
            chainId,
            sellAmount: swapDto.sellAmount,
            taker: swapDto.taker
        });

        return await this.executeSwapAndFill(swapDto.chainName, swapResponse, fillDto);
    }
}
