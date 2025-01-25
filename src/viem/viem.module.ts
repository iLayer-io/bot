import { Module } from '@nestjs/common';
import { ViemService } from './viem.service.js';

@Module({
  providers: [ViemService],
  exports: [ViemService],
})
export class ViemModule {}
