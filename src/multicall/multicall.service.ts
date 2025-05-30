import { Options } from '@layerzerolabs/lz-v2-utilities'
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getAddress, ethers, Wallet, Contract } from 'ethers';
import { ExecutorEncoder } from 'executooor-ethers';

import { OrderHubABI } from '../contracts/abi/order-hub.abi';
import { OrderSpokeABI } from '../contracts/abi/order-spoke.abi';
import { ZeroxService } from '../zerox/zerox.service';

import { FillOrderDto, ZeroxSwapDto } from '../dto/contracts.dto';
import { pad32 } from 'src/utils/utils';

@Injectable()
export class MulticallService {
    private readonly executors = new Map<string, ExecutorEncoder>();
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
            this.executors.set(chain.name, new ExecutorEncoder(executorAddress, wallet));

            if (chain.order_hub_contract_address) {
                const hub = new Contract(chain.order_hub_contract_address, OrderHubABI, provider);
                this.orderHubs.set(chain.name, hub);
            }

            if (chain.order_spoke_contract_address) {
                const spoke = new Contract(chain.order_spoke_contract_address, OrderSpokeABI, provider);
                this.orderSpokes.set(chain.name, spoke);
            }
        }
    }

    getExecutor(chainName: string): ExecutorEncoder {
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
        const encoder = this.getExecutor(chainName); // from your MulticallService
        const spender = swapResponse.issues?.allowance?.spender;
        const sellToken = swapResponse.sellToken;
        const sellAmount = BigInt(swapResponse.sellAmount);

        if (spender) {
            encoder.erc20Approve(sellToken, spender, sellAmount);
        }

        encoder.pushCall(
            swapResponse.transaction.to,
            0n,
            swapResponse.transaction.data
        );

        // FillOrder logic (same parameters as your `fillOrder()` method)
        const orderSpoke = this.getOrderSpoke(chainName);
        if (!orderSpoke) {
            throw new Error(`OrderSpoke contract not found for chain ${chainName}`);
        }
        const options = Options.newOptions().addExecutorLzReceiveOption(1e5, 0).toHex();
        fillDto.options = options;

        const fee = await orderSpoke.estimateBridgingFee(
            fillDto.order.sourceChainEid,
            fillDto.order.callData,
            fillDto.options
        );

        const paddedWallet = pad32(fillDto.fundingWallet as `0x${string}`);

        encoder.pushCall(
            orderSpoke.target as `0x${string}`,
            fee * 110n / 100n,
            orderSpoke.interface.encodeFunctionData('fillOrder', [
                fillDto.order,
                fillDto.orderNonce,
                paddedWallet,
                fillDto.maxGas,
                fillDto.options
            ])
        );

        return await encoder.exec({ gasLimit: 10_000_000 });
    }

    async swapAndFillUsingExecutor(
        swapDto: ZeroxSwapDto,
        fillDto: FillOrderDto
    ): Promise<any> {
        const chains = this.configService.get('chains');
        const chain = chains.find(c => c.name === swapDto.chainName);

        if (!chain) {
            throw new Error(`Chain ${swapDto.chainName} not found in configuration`);
        }

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
            taker: this.getWallet(swapDto.chainName).address, // from MulticallService
        });

        return await this.executeSwapAndFill(swapDto.chainName, swapResponse, fillDto);
    }

}
