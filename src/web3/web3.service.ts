import { Injectable, Logger } from '@nestjs/common';
import {
  Account,
  Address,
  BlockTag,
  Client,
  concat,
  createClient,
  encodeAbiParameters,
  GetBlockReturnType,
  GetFilterLogsReturnType,
  http,
  keccak256,
  Log,
  publicActions,
  PublicActions,
  PublicRpcSchema,
  toHex,
  Transport,
  WalletActions,
  walletActions,
  WalletRpcSchema,
  WatchContractEventOnLogsParameter,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { BotChain, CustomConfigService } from '../config/config.service.js';
import { abi as orderHubAbi } from './abi/OrderHub.abi.js';
import { abi as orderSpokeAbi } from './abi/OrderSpoke.abi.js';
import { foundry as MockERC20Foundry } from './abi/MockERC20.foundry.js';

// type OrderCreatedEvent = ExtractEventArgs<typeof orderHubAbi, 'OrderCreated'>;

export type OrderWithdrawnEvent = Log<
  bigint,
  number,
  false,
  Extract<
    (typeof orderHubAbi)[number],
    { type: 'event'; name: 'OrderWithdrawn' }
  >,
  false,
  typeof orderHubAbi
>;

export type OrderSettledEvent = Log<
  bigint,
  number,
  false,
  Extract<
    (typeof orderHubAbi)[number],
    { type: 'event'; name: 'OrderSettled' }
  >,
  false,
  typeof orderHubAbi
>;

export type OrderCreatedEvent = Log<
  bigint,
  number,
  false,
  Extract<
    (typeof orderHubAbi)[number],
    { type: 'event'; name: 'OrderCreated' }
  >,
  false,
  typeof orderHubAbi
>;

export type OrderFilledEvent = Log<
  bigint,
  number,
  false,
  Extract<
    (typeof orderSpokeAbi)[number],
    { type: 'event'; name: 'OrderFilled' }
  >,
  false,
  typeof orderSpokeAbi
>;

export type OrderHubLog = WatchContractEventOnLogsParameter<
  typeof orderHubAbi
>[number];

export type OrderSpokeLog = WatchContractEventOnLogsParameter<
  typeof orderSpokeAbi
>[number];

// TODO Use Viem typing derived from ABI iof hardcoding the Token signature

export type TOrder = NonNullable<OrderCreatedEvent['args']['order']>;
export type TToken = TOrder['inputs'][0] | TOrder['outputs'][0];

const TOKEN_TYPEHASH = keccak256(
  toHex(
    'Token(uint8 tokenType,bytes32 tokenAddress,uint256 tokenId,uint256 amount)',
  ),
);

// TODO Use Viem typing derived from ABI iof hardcoding the Token signature
const ORDER_TYPEHASH = keccak256(
  toHex(
    'Order(bytes32 user,bytes32 inputsHash,bytes32 outputsHash,uint32 sourceChainEid,uint32 destinationChainEid,bool sponsored,uint64 deadline,bytes32 callRecipient,bytes callData)',
  ),
);

@Injectable()
export class Web3Service {
  private logger = new Logger(Web3Service.name);
  private clients: Map<
    string,
    Client<
      Transport,
      undefined,
      Account,
      [...PublicRpcSchema, ...WalletRpcSchema],
      PublicActions<Transport, undefined, Account> &
        WalletActions<undefined, Account>
    >
  >;
  private chainMap: Map<string, BotChain>;

  constructor(private configService: CustomConfigService) {
    this.clients = new Map();
    this.chainMap = new Map();

    for (const chain of this.configService.botConfig.chain) {
      this.chainMap.set(chain.name, chain);
      const client = createClient({
        transport: http(chain.rpc_url),
        key: 'client',
        name: 'Client',
        account: privateKeyToAccount(chain.private_key),
      });

      const clientWPublic = client.extend(publicActions).extend(walletActions);

      this.clients.set(chain.name, clientWPublic);
    }
  }

  async getBlockNumber(chainName: string): Promise<bigint> {
    return await this.clients.get(chainName)!.getBlockNumber();
  }

  async getBlockBatch(
    chainName: string,
    blockNumbers: bigint[],
  ): Promise<GetBlockReturnType<undefined, false, BlockTag>[]> {
    return Promise.all(
      blockNumbers.map(async (blockNumber) => {
        return this.clients.get(chainName)!.getBlock({ blockNumber });
      }),
    );
  }

  async getBlockBatchOrderHubLogs({
    chainName,
    fromBlock,
    toBlock,
  }: {
    chainName: string;
    fromBlock: bigint;
    toBlock: bigint;
  }): Promise<
    GetFilterLogsReturnType<typeof orderHubAbi | typeof orderSpokeAbi>
  > {
    const client = this.clients.get(chainName)!;
    const filter = await client.createContractEventFilter({
      abi: [...orderHubAbi, ...orderSpokeAbi],
      address: [
        this.chainMap.get(chainName)!.order_hub_contract_address,
        this.chainMap.get(chainName)!.order_spoke_contract_address,
      ],
      fromBlock,
      toBlock,
    });
    const result = await client.getFilterLogs({ filter });
    return result;
  }

  async watcOrderHubLogs({
    chainName,
    fromBlock,
    onLog,
  }: {
    chainName: string;
    fromBlock: bigint;
    onLog: (log: OrderHubLog) => Promise<void>;
  }): Promise<void> {
    const client = this.clients.get(chainName)!;
    client.watchContractEvent({
      address: this.chainMap.get(chainName)!.order_hub_contract_address,
      abi: orderHubAbi,
      fromBlock: fromBlock,
      onLogs: (logs) => {
        logs.forEach((log) => {
          onLog(log).catch((error) => console.error(error));
        });
      },
      onError: (error) => {
        console.error(error);
      },
    });
  }

  async getAddress({ chainName }: { chainName: string }): Promise<Address> {
    const client = this.clients.get(chainName)!;
    const addresses = await client.getAddresses();
    return addresses[0];
  }

  async watcOrderSpokeLogs({
    chainName,
    fromBlock,
    onLog,
  }: {
    chainName: string;
    fromBlock: bigint;
    onLog: (log: OrderSpokeLog) => Promise<void>;
  }): Promise<void> {
    const client = this.clients.get(chainName)!;
    client.watchContractEvent({
      address: this.chainMap.get(chainName)!.order_spoke_contract_address,
      abi: orderSpokeAbi,
      fromBlock: fromBlock,
      onLogs: (logs) => {
        logs.forEach((log) => {
          onLog(log).catch((error) => console.error(error));
        });
      },
      onError: (error) => {
        console.error(error);
      },
    });
  }

  hashTokenStruct(token: TToken): `0x${string}` {
    const encodedData = encodeAbiParameters(
      [
        { type: 'bytes32' }, // TOKEN_TYPEHASH
        { type: 'uint8' }, // tokenType
        { type: 'address' }, // tokenAddress
        { type: 'uint256' }, // tokenId
        { type: 'uint256' }, // amount
      ],
      [
        TOKEN_TYPEHASH,
        token.tokenType,
        token.tokenAddress,
        token.tokenId,
        token.amount,
      ],
    );
    return keccak256(encodedData);
  }

  hashTokenArray(tokens: readonly TToken[]): `0x${string}` {
    const tokenHashes: `0x${string}`[] = tokens.map((token) =>
      this.hashTokenStruct(token),
    );
    const packedHashes = concat(tokenHashes);
    return keccak256(packedHashes);
  }

  hashOrder(order: TOrder): `0x${string}` {
    const inputsHash = this.hashTokenArray(order.inputs);
    const outputsHash = this.hashTokenArray(order.outputs);

    const encodedData = encodeAbiParameters(
      [
        { type: 'bytes32' }, // ORDER_TYPEHASH
        { type: 'bytes32' }, // user
        { type: 'bytes32' }, // inputsHash
        { type: 'bytes32' }, // outputsHash
        { type: 'uint32' }, // sourceChainEid
        { type: 'uint32' }, // destinationChainEid
        { type: 'bool' }, // sponsored
        { type: 'uint64' }, // deadline
        { type: 'bytes32' }, // callRecipient
        { type: 'bytes32' }, // hashed callData
      ],
      [
        ORDER_TYPEHASH,
        order.user,
        inputsHash,
        outputsHash,
        order.sourceChainEid,
        order.destinationChainEid,
        order.sponsored,
        order.deadline,
        order.callRecipient,
        keccak256(order.callData),
      ],
    );

    return keccak256(encodedData);
  }

  async getBalance({
    chainName,
    symbol,
  }: {
    chainName: string;
    symbol: string;
  }): Promise<bigint> {
    const client = this.clients.get(chainName)!;
    const chainConfig = this.chainMap.get(chainName)!;
    const address = chainConfig.tokens.find(
      (t) => t.symbol === symbol,
    )?.address;

    if (address === undefined) {
      throw new Error(
        `Invalid symbol ${symbol}, token not found to get balance`,
      );
    }
    const fillerAddress = (await client.getAddresses())[0];

    const result = await client.readContract({
      address,
      abi: MockERC20Foundry.abi,
      functionName: 'balanceOf',
      args: [fillerAddress],
    });

    return result;
  }
}
