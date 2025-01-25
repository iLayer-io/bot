import { Injectable } from '@nestjs/common';
import { http, createClient, PublicClient, publicActions } from 'viem';
import { foundry } from 'viem/chains';
import { CustomConfigService } from '../config/config.service.js';
import { privateKeyToAccount } from 'viem/accounts';

@Injectable()
export class ViemService {
  private client: PublicClient;

  constructor(private configService: CustomConfigService) {
    const rpcUrl = this.configService.botConfig.rpcUrl;
    const privateKey = this.configService.botConfig.privateKey;
    const client = createClient({
      chain: foundry,
      transport: http(rpcUrl),
      key: 'client',
      name: 'Client',
      account: privateKeyToAccount(privateKey),
    });

    // @ts-expect-error: expected error
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    this.client = client.extend(publicActions);
  }

  async getBlockNumber(): Promise<bigint> {
    return await this.client.getBlockNumber();
  }
}
