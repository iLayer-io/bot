import { Module } from '@nestjs/common';
import { DatabaseWatcherService } from './database-watcher.service.js';

@Module({
  providers: [DatabaseWatcherService],
})
export class DatabaseWatcherModule {}
