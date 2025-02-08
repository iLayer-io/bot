import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CustomConfigService } from '../config/config.service.js';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { BlockchainFillerService } from '../blockchain-filler/blockchain-filler.service.js';

@Injectable()
export class DatabaseWatcherService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseWatcherService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: CustomConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly blockchainFillerService: BlockchainFillerService,
  ) {}

  onModuleInit() {
    const job = new CronJob(`*/5 * * * * *`, async () => {
      this.logger.debug({ message: 'running db watcher job' });
      const orders = await this.prismaService.order.findMany({
        where: { order_status: 'Created' },
      });

      for (const order of orders) {
        this.logger.debug({
          message: `found order ${order.id} for chain ${order.chain_id}`,
        });
        const chainConfig = this.configService.getChainConfig(order.chain_id);
        await this.blockchainFillerService.fillOrder(chainConfig, order);
      }
    });

    job.start();
  }
}
// TODO scheduled task to check for ready orders in the database
