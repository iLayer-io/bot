import { Module } from '@nestjs/common';
import { BlockchainFillerService } from './blockchain-filler.service.js';

@Module({
  providers: [BlockchainFillerService],
})
export class BlockchainFillerModule {}
