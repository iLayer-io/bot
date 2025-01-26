import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Subject } from 'rxjs';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  logger = new Logger(PrismaService.name);
  private shutdownListener$: Subject<void> = new Subject();

  constructor() {
    super({ log: [{ level: 'query', emit: 'event' }] });
  }

  async onModuleInit() {
    await this.$connect();
    // @ts-expect-error error
    this.$on('query', (e: { query: string; params: string }) => {
      const { query, params } = e;

      this.logger.debug({ query, params });
    });
    // @ts-expect-error error
    this.$on('error', (event) => {
      this.logger.error({ event });
      this.shutdown();
    });
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
  subscribeToShutdown(shutdownFn: () => Promise<void>): void {
    this.shutdownListener$.subscribe(() => {
      shutdownFn().catch((error) => this.logger.error(error));
    });
  }

  shutdown() {
    this.shutdownListener$.next();
  }
}
