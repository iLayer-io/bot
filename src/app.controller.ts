import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Controller()
export class AppController {
  constructor() {}

  @Get('/health')
  getHealth(): string {
    return 'ok';
  }
}
