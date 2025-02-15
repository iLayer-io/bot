import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CustomConfigService } from '../config/config.service.js';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { BlockchainFillerService } from '../blockchain-filler/blockchain-filler.service.js';
import { Web3Service } from '../web3/web3.service.js';

@Injectable()
export class DatabaseWatcherService implements OnModuleInit {
  // TODO FIXME Maybe find a cleaner way to handle scheduled tasks and db orders monitoring
  // TODO FIXME schedule a task to delete expired orders
  private readonly logger = new Logger(DatabaseWatcherService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: CustomConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly blockchainFillerService: BlockchainFillerService,
    private readonly web3Service: Web3Service,
  ) {}

  onModuleInit() {
    const job = new CronJob(`*/5 * * * * *`, async () => {
      await this.fillReadyOrders();
    });
    job.start();
  }

  async fillReadyOrders() {
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
  }
}
// TODO scheduled task to check for ready orders in the database
