import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { ViemModule } from './viem/viem.module.js';
import { CustomConfigModule } from './config/config.module.js';
import { PrismaService } from './prisma.service.js';
import { BlockchainListenerModule } from './blockchain-listener/blockchain-listener.module.js';
import { BlockchainFillerModule } from './blockchain-filler/blockchain-filler.module';
import { DatabaseWatcherModule } from './database-watcher/database-watcher.module';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
  imports: [BlockchainFillerModule, DatabaseWatcherModule],
})
class PrismaModule {}

@Module({
  imports: [
    PrismaModule,
    ViemModule,
    CustomConfigModule,
    BlockchainListenerModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
