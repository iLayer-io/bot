import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Contract, ethers, Wallet } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import {
    Account,
    Client,
    concat,
    createClient,
    createWalletClient,
    getContract,
    Hex,
    http,
    HttpTransport,
    numberToHex,
    publicActions,
    PublicActions,
    PublicRpcSchema,
    size,
    WalletClient
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import * as viemChains from 'viem/chains';

import { RFQDto, ZeroxSwapDto } from 'src/dto/contracts.dto';

@Injectable()
export class ZeroxService implements OnModuleInit {
    private readonly logger = new Logger(ZeroxService.name);
    private client: any;

    private readonly providers: Map<string, ethers.JsonRpcProvider>;
    private readonly wallets: Map<string, Wallet>;
    private readonly walletClients: Map<
        string,
        WalletClient<HttpTransport, undefined, Account, PublicRpcSchema>
    >;
    private readonly publicClients: Map<
        string,
        Client<HttpTransport, undefined, Account, PublicRpcSchema, PublicActions<HttpTransport, undefined>>
    >;

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService
    ) {
        const apiKey = this.configService.get<string>('ZEROX_API_KEY');
        if (!apiKey) throw new Error('Missing ZEROX_API_KEY');

        this.providers = new Map();
        this.wallets = new Map();
        this.walletClients = new Map();
        this.publicClients = new Map();

        const chains = this.configService.get<any[]>('chains') ?? [];

        for (const chain of chains) {
            const rpcUrl = this.configService.get<string>(chain.rpc_url_environment_variable);
            if (!rpcUrl) throw new Error(`Missing RPC_URL for chain ${chain.name}`);

            const privateKey = this.configService.get<string>(chain.private_key_environment_variable);
            if (!privateKey) throw new Error(`Missing PRIVATE_KEY for chain ${chain.name}`);

            const provider = new ethers.JsonRpcProvider(rpcUrl);
            const wallet = new Wallet(privateKey, provider);

            this.providers.set(chain.name, provider);
            this.wallets.set(chain.name, wallet);

            const account = privateKeyToAccount(privateKey as `0x${string}`);

            const walletClient = createWalletClient({
                transport: http(rpcUrl),
                key: 'client',
                name: 'Client',
                account,
            });
            this.walletClients.set(chain.name, walletClient);

            const client = createClient({
                transport: http(rpcUrl),
                key: 'client',
                name: 'Client',
                account,
            });
            this.publicClients.set(chain.name, client.extend(publicActions));
        }
    }

    async onModuleInit() {
        const { createClientV2 } = await import('@0x/swap-ts-sdk');
        const apiKey = this.configService.get<string>('ZEROX_API_KEY');
        if (!apiKey) throw new Error('Missing ZEROX_API_KEY');
        this.client = createClientV2({ apiKey });
    }
    /**
     * Gets a price quote from the 0x API using the permit2 endpoint.
     * @param params An object containing buyToken, chainId, sellAmount, and sellToken.
     * @returns A promise with the price quote.
     */
    async getPrice(params: {
        buyToken: string;
        chainId: number;
        sellAmount: string;
        sellToken: string;
    }): Promise<any> {
        try {
            const price = await this.client.swap.permit2.getPrice.query(params);
            this.logger.log(`Received price quote: ${JSON.stringify(price)}`);
            return price;
        } catch (error) {
            this.logger.error('Error fetching price from 0x API', error);
            throw error;
        }
    }

    async getQuoteAndAppendSignature(
        params: {
            chainName: string;
            buyToken: string;
            chainId: number;
            sellAmount: string;
            sellToken: string;
            taker: string;
        }
    ): Promise<any> {
        const walletClient = this.walletClients.get(params.chainName)!;

        const response = await this.client.swap.permit2.getQuote.query(params);
        // console.log("Received quote", response);

        // Attempt to sign the permit2 message if available.
        let signature: Hex | undefined;
        if (response.permit2?.eip712) {
            try {
                signature = await walletClient.signTypedData(response.permit2.eip712);
                console.log("Signed permit2 message from quote response: signature", signature);
            } catch (error) {
                console.error("Error signing permit2 message:", error);
            }

            // Append the signature and its length (hex formatted) to the transaction data.
            if (signature && response?.transaction?.data) {
                const signatureLengthInHex = numberToHex(size(signature), {
                    signed: false,
                    size: 32,
                });
                const transactionData = response.transaction.data as Hex;
                response.transaction.data = concat([transactionData, signatureLengthInHex, signature,]);
                // console.log("Modified transaction data with signature:", response.transaction.data);
            } else {
                throw new Error("Failed to obtain signature or transaction data");
            }
        }

        // Return the modified quote response.
        return response;
    }

    /**
     * Executes a swap using the 0x API.
     * @param params An object containing chainName, buyToken, chainId, sellAmount, sellToken.
     * @returns A promise with the transaction hash.
     */
    async executeSwap(response: any, chainName: string): Promise<any> {
        const walletClient = this.walletClients.get(chainName)!;
        const publicClient = this.publicClients.get(chainName)!;
        const wallet = this.wallets.get(chainName); // same map logic you use in MulticallService
        if (!wallet) throw new Error(`Wallet not found for chain ${chainName}`);
        try {
            // deal with the allowance if needed
            if (response.issues?.allowance != null) {
                const functionSignature = "approve(address,uint256)";
                const iface = new ethers.Interface([`function ${functionSignature}`]);
                const data = iface.encodeFunctionData("approve", [
                    response.issues.allowance.spender,
                    BigInt(response.sellAmount),
                ]);
                const tx = await wallet.sendTransaction({
                    to: response.sellToken,
                    data: data,
                });
                console.log("Approval transaction hash:", tx.hash);
            }

            // sign the transaction
            const nonce = await publicClient.getTransactionCount({
                address: walletClient.account.address,
            });
            console.log("nonce", nonce);
            const viemChain = (viemChains as Record<string, any>)[chainName];
            if (!viemChain) {
                throw new Error(`Unsupported chainName: ${chainName}`);
            }

            const signedTransaction = await walletClient.signTransaction({
                account: walletClient.account,
                chain: viemChain,
                gas: !!response?.transaction.gas
                    ? BigInt(response?.transaction.gas)
                    : undefined,
                to: response.transaction.to,
                data: response.transaction.data,
                gasPrice: BigInt("100000000"),
                nonce: nonce,
            });

            console.log("Signed transaction:", signedTransaction);

            // send the transaction
            const hash = await walletClient.sendRawTransaction({
                serializedTransaction: signedTransaction,
            });

            console.log("Transaction hash:", hash);
            return hash;
        } catch (error) {
            this.logger.error('Error executing swap through 0x API', error);
            throw error;
        }
    }

    async swap(zeroxSwapDto: ZeroxSwapDto): Promise<any> {
        const chains = this.configService.get('chains');
        const chain = chains.find(c => c.name === zeroxSwapDto.chainName);

        if (!chain) {
            throw new Error(`Chain ${zeroxSwapDto.chainName} not found in configuration`);
        }

        const resolveTokenAddress = (symbol: string): string => {
            const token = chain.tokens.find(t => t.symbol === symbol);
            if (!token) {
                throw new Error(`Token ${symbol} not found in config for chain ${chain.name}`);
            }
            return token.address;
        };

        const buyToken = resolveTokenAddress(zeroxSwapDto.buyTokenName);
        const sellToken = resolveTokenAddress(zeroxSwapDto.sellTokenName);
        const chainId = chain.chain_id;

        const wallet = this.wallets.get(chain.name);
        if (!wallet) {
            throw new Error(`Wallet not configured for chain ${chain.name}`);
        }

        const response = await this.getQuoteAndAppendSignature({
            chainName: zeroxSwapDto.chainName,
            buyToken,
            sellToken,
            chainId,
            sellAmount: zeroxSwapDto.sellAmount,
            taker: zeroxSwapDto.taker
        });

        const swapResponse = await this.executeSwap(response, zeroxSwapDto.chainName);
        console.log("swapResponse", swapResponse);

        return swapResponse;
    }



    async rfq(rfqDto: RFQDto): Promise<any> {

        const chains = this.configService.get('chains');
        const chain = chains.find(c => c.name === rfqDto.chainName);

        if (!chain) {
            throw new Error(`Chain ${rfqDto.chainName} not found in configuration`);
        }

        const resolveTokenAddress = (symbol: string): string => {
            const token = chain.tokens.find(t => t.symbol === symbol);
            if (!token) {
                throw new Error(`Token ${symbol} not found in config for chain ${chain.name}`);
            }
            return token.address;
        };

        const buyToken = resolveTokenAddress(rfqDto.buyTokenName);
        const sellToken = resolveTokenAddress(rfqDto.sellTokenName);
        const chainId = chain.chain_id;

        return this.getPrice({
            buyToken,
            chainId,
            sellAmount: rfqDto.sellAmount,
            sellToken
        });
    }

}