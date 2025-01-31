import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { ViemModule } from './viem/viem.module.js';
import { CustomConfigModule } from './config/config.module.js';
import { PrismaService } from './prisma.service.js';
import { BlockchainListenerModule } from './blockchain-listener/blockchain-listener.module.js';
import { BlockchainFillerModule } from './blockchain-filler/blockchain-filler.module.js';
import { DatabaseWatcherModule } from './database-watcher/database-watcher.module.js';
import { ScheduleModule } from '@nestjs/schedule';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
  imports: [],
})
class PrismaModule {}

@Module({
  imports: [
    PrismaModule,
    ViemModule,
    CustomConfigModule,
    BlockchainListenerModule,
    BlockchainFillerModule,
    DatabaseWatcherModule,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
})
export class AppModule {}
