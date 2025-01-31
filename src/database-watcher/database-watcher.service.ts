import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CustomConfigService } from '../config/config.service.js';
import { Interval, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class DatabaseWatcherService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseWatcherService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: CustomConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    const job = new CronJob(`${3} * * * * *`, () => {
      this.logger.warn(`time (${3}) for job asdasd to run!`);
    });

    // this.schedulerRegistry.addCronJob('asd', job);
    job.start();
  }
}
// TODO scheduled task to check for ready orders in the database
