import { Injectable, Logger } from '@nestjs/common';
import { Contract, ethers, Wallet } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { createClientV2 } from '@0x/swap-ts-sdk';
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
import { arbitrum } from 'viem/chains';

@Injectable()
export class ZeroxService {
    private readonly logger = new Logger(ZeroxService.name);
    private readonly client: any;

    private provider: ethers.JsonRpcProvider;
    private readonly walletClients: Map<
        string,
        WalletClient<
            HttpTransport,
            undefined,
            Account,
            PublicRpcSchema
        >
    >;
    private readonly publicClients: Map<
        string,
        Client<
            HttpTransport,
            undefined,
            Account,
            PublicRpcSchema,
            PublicActions<HttpTransport, undefined>
        >
    >;

    private wallet: Wallet;

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService
    ) {
        const apiKey = this.configService.get<string>('ZEROX_API_KEY');
        if (!apiKey) throw new Error('Missing ZEROX_API_KEY');

        const rpcUrl = this.configService.get<string>('RPC_URL');
        if (!rpcUrl) throw new Error('Missing RPC_URL');

        const privateKey = this.configService.get<string>('USER_PRIVATE_KEY');
        if (!privateKey) throw new Error('Missing USER_PRIVATE_KEY');

        const provider = new ethers.JsonRpcProvider(rpcUrl);

        this.wallet = new Wallet(privateKey, provider);
        this.walletClients = new Map();
        this.publicClients = new Map();
        this.client = createClientV2({ apiKey });
        this.provider = provider;

        const chains = this.configService.get<any[]>('chains') ?? [];

        for (const chain of chains) {
            const walletClient = createWalletClient({
                account: {
                    address: this.wallet.address as `0x${string}`,
                    type: 'json-rpc',
                },
                chain: chain.name,
                transport: http(chain.rpcUrl),
            });
            this.walletClients.set(chain.name, walletClient);

            const client = createClient({
                transport: http(chain.rpc_url),
                key: 'client',
                name: 'Client',
                account: privateKeyToAccount(privateKey as `0x${string}`),
            });
            const publicClient = client.extend(publicActions)
            this.publicClients.set(chain.name, publicClient);
        }
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
        console.log("Received quote", response);

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
            } else {
                throw new Error("Failed to obtain signature or transaction data");
            }
        }

        // Return the modified quote response.
        return response;
    }


    /**
     * Executes a swap using the 0x API.
     * @param params An object containing chainName, buyToken, chainId, sellAmount, sellToken, and taker.
     * @returns A promise with the transaction hash.
     */
    async executeSwap(response: any, chainName: string): Promise<any> {
        const walletClient = this.walletClients.get(chainName)!;
        const publicClient = this.publicClients.get(chainName)!;
        try {
            // deal with the allowance if needed
            if (response.issues?.allowance != null) {
                const functionSignature = "approve(address,uint256)";
                const iface = new ethers.Interface([`function ${functionSignature}`]);
                const data = iface.encodeFunctionData("approve", [
                    response.issues.allowance.spender,
                    BigInt("1000000000"),
                ]);
                const tx = await this.wallet.sendTransaction({
                    to: response.sellToken,
                    data: data,
                });
                console.log("Approval transaction hash:", tx.hash);
            }

            // sign the transaction
            const nonce = await publicClient.getTransactionCount({
                address: walletClient.account.address,
            });

            const signedTransaction = await walletClient.signTransaction({
                account: walletClient.account,
                chain: arbitrum, // TODO: add support for other chains
                gas: !!response?.transaction.gas
                    ? BigInt(response?.transaction.gas)
                    : undefined,
                to: response.transaction.to,
                data: response.transaction.data,
                gasPrice: BigInt("100000000"),
                nonce: nonce,
            });

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
}