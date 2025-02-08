import { Module } from '@nestjs/common';
import { BlockchainFillerService } from './blockchain-filler.service.js';

@Module({
  providers: [BlockchainFillerService],
  exports: [BlockchainFillerService],
})
export class BlockchainFillerModule {}
