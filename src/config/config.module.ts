import { Module, Global } from '@nestjs/common';
import { CustomConfigService } from './config.service.js';

@Global()
@Module({
  providers: [CustomConfigService],
  exports: [CustomConfigService],
})
export class CustomConfigModule {}
