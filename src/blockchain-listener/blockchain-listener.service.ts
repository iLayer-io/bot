import { Injectable, OnModuleInit } from '@nestjs/common';
import { BotChain, CustomConfigService } from '../config/config.service.js';
import { OrderHubLog, ViemService } from '../viem/viem.service.js';
import { PrismaService } from '../prisma.service.js';
import { Logger } from '@nestjs/common';

@Injectable()
export class BlockchainListenerService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainListenerService.name);

  constructor(
    private readonly configService: CustomConfigService,
    private readonly viemService: ViemService,
    private readonly prismaService: PrismaService,
  ) {}

  onModuleInit() {
    this.initializeListener().catch((error) => {
      console.error(error);
    });
  }

  private async initializeListener() {
    const promises = this.configService.botConfig.chain.map(async (chain) => {
      const lastCheckpoint =
        await this.prismaService.block_checkpoint.findFirst({
          where: {
            chain_id: {
              equals: chain.chain_id,
            },
          },
          orderBy: {
            height: 'desc',
          },
        });

      let fromBlock = 0n;

      if (!lastCheckpoint) {
        fromBlock = BigInt(chain.start_block);
      } else if (lastCheckpoint.height < chain.start_block) {
        throw new Error(
          'Starting block from the database is less than the configured starting block. \
                        Orders may remain stuck forever. Please fix the database inconsistency.',
        );
      } else {
        fromBlock = lastCheckpoint.height;
      }

      // TODO FIXME Run polling

      this.logger.log({
        message: `Starting listener`,
        chain: chain.name,
        fromBlock: fromBlock,
      });

      return this.viemService.watcOrderHubLogs({
        chainName: chain.name,
        fromBlock: fromBlock,
        onLog: async (log) => {
          await this.handleLog({ log, chain });
        },
      });
    });
    await Promise.any(promises);
  }

  private async handleLog({
    log,
    chain,
  }: {
    log: OrderHubLog;
    chain: BotChain;
  }) {
    // TODO FIXME Write to database the received log
    console.log(chain, log);
  }
}
