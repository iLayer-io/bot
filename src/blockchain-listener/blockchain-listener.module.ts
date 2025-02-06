import { Module } from '@nestjs/common';
import { Web3Module } from '../web3/web3.module.js';
import { BlockchainListenerService } from './blockchain-listener.service.js';

export const BOTCHAIN_TOKEN = 'BotChain';

@Module({
  imports: [Web3Module],
  providers: [BlockchainListenerService],
})
export class BlockchainListenerModule {}
