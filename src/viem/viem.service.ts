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
} from 'viem';
import { CustomConfigService } from '../config/config.service.js';
import { privateKeyToAccount } from 'viem/accounts';

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

  constructor(private configService: CustomConfigService) {
    this.clients = new Map();
    for (const chain of this.configService.botConfig.chain) {
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
}
