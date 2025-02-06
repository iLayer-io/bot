import { Injectable } from '@nestjs/common';
import {
  Abi,
  Account,
  BlockTag,
  Client,
  createClient,
  GetBlockReturnType,
  GetFilterLogsReturnType,
  http,
  HttpTransport,
  Log,
  publicActions,
  PublicActions,
  PublicRpcSchema,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { BotChain, CustomConfigService } from '../config/config.service.js';
import { abi as orderHubAbi } from './abi/OrderHub.abi.js';
import { abi as orderSpokeAbi } from './abi/OrderSpoke.abi.js';

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

export type OrderHubLog = Log<
  bigint,
  number,
  false,
  Extract<(typeof orderHubAbi)[number], { type: 'event' }>,
  false
>;

export type OrderSpokeLog = Log<
  bigint,
  number,
  false,
  Extract<(typeof orderSpokeAbi)[number], { type: 'event' }>,
  false
>;

@Injectable()
export class Web3Service {
  private clients: Map<
    string,
    Client<
      HttpTransport,
      undefined,
      Account,
      PublicRpcSchema,
      PublicActions<HttpTransport, undefined>
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

      const clientWPublic = client.extend(publicActions);

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

  async getBlockBatchLogs({
    chainName,
    fromBlock,
    toBlock,
  }: {
    chainName: string;
    fromBlock: bigint;
    toBlock: bigint;
  }): Promise<
    GetFilterLogsReturnType<Abi, undefined, undefined, bigint, bigint>
  > {
    const client = this.clients.get(chainName)!;
    const filter = await client.createContractEventFilter({
      abi: orderHubAbi,
      address: this.chainMap.get(chainName)!.order_hub_contract_address,
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
}
