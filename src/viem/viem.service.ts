import { Injectable } from '@nestjs/common';
import {
  http,
  createClient,
  publicActions,
  Client,
  Account,
  PublicRpcSchema,
  PublicActions,
  HttpTransport,
  GetBlockReturnType,
  BlockTag,
  Abi,
  GetFilterLogsReturnType,
} from 'viem';
import { Chain, CustomConfigService } from '../config/config.service.js';
import { privateKeyToAccount } from 'viem/accounts';
import { abi as orderHubAbi } from './abi/OrderHub.abi.js';

@Injectable()
export class ViemService {
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
  private orderHubAbi: Abi;
  private chainMap: Map<string, Chain>;

  constructor(private configService: CustomConfigService) {
    this.orderHubAbi = orderHubAbi;
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
      abi: this.orderHubAbi,
      address: this.chainMap.get(chainName)!.order_contract_address,
      fromBlock,
      toBlock,
      eventName: 'OrderCreated',
    });
    const result = await client.getFilterLogs({ filter });
    return result;
  }
}
