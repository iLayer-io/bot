import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { ViemModule } from './viem/viem.module.js';
import { CustomConfigModule } from './config/config.module.js';
import { PrismaService } from './prisma.service.js';
import { BlockchainListenerModule } from './blockchain-listener/blockchain-listener.module.js';

@Module({
  imports: [ViemModule, CustomConfigModule, BlockchainListenerModule],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
