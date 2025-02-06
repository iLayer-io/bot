import { Module } from '@nestjs/common';
import { ViemModule } from '../web3/web.module.js';
import { BlockchainListenerService } from './blockchain-listener.service.js';

export const BOTCHAIN_TOKEN = 'BotChain';

@Module({
  imports: [ViemModule],
  providers: [BlockchainListenerService],
})
export class BlockchainListenerModule {}
