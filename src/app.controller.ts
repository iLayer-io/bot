import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { block_checkpoint } from '@prisma/client';

@Controller()
export class AppController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get('/health')
  getHealth(): string {
    return 'ok';
  }

  @Get('/list')
  async getList(): Promise<block_checkpoint | null> {
    await this.prismaService.block_checkpoint.create({
      data: {
        chain_id: 3n,
        height: 1,
      },
    });
    const list = await this.prismaService.block_checkpoint.findFirst({});
    return list;
  }
}
