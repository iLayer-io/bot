import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { config } from '../../config.js';

export interface CustomConfig {
  rpcUrl: string;
  privateKey: `0x${string}`;
}

@Injectable()
export class CustomConfigService extends NestConfigService {
  public get botConfig(): CustomConfig {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    console.log(config);
    return {
      rpcUrl: '',
      privateKey: this.get<`0x${string}`>(
        'PRIVATE_KEY',
        '0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6',
      ),
    };
  }
}
