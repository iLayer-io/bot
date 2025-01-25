import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ViemModule } from './viem/viem.module.js';
import { CustomConfigModule } from './config/config.module.js';

@Module({
  imports: [ViemModule, CustomConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
