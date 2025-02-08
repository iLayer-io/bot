import { Module } from '@nestjs/common';
import { DatabaseWatcherService } from './database-watcher.service.js';
import { BlockchainFillerModule } from '../blockchain-filler/blockchain-filler.module.js';

@Module({
  imports: [BlockchainFillerModule],
  providers: [DatabaseWatcherService],
})
export class DatabaseWatcherModule {}
