import { Module } from '@nestjs/common';
import { ViemService } from './web.service.js';

@Module({
  providers: [ViemService],
  exports: [ViemService],
})
export class ViemModule {}
