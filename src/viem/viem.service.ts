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

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const clientWPublic: Client<
        HttpTransport,
        undefined,
        Account,
        PublicRpcSchema,
        PublicActions<HttpTransport, undefined>
      > = client.extend(publicActions);

      this.clients.set(chain.name, clientWPublic);
    }
  }

  async getBlockNumber(chainName: string): Promise<bigint> {
    return await this.clients.get(chainName)!.getBlockNumber();
  }
}
