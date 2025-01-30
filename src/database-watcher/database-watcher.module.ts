import { Module } from '@nestjs/common';
import { DatabaseWatcherService } from './database-watcher.service';

@Module({
  providers: [DatabaseWatcherService]
})
export class DatabaseWatcherModule {}
