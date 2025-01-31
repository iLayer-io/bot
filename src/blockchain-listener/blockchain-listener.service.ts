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

      // TODO FIXME Consume batch blocks

      this.logger.log({
        message: `Starting listener`,
        chain: chain.name,
        fromBlock: fromBlock,
      });

      // TODO FIXME Add OrderSpoke OrderFilled event listener
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
    // await this.prismaService.order.create({
    //   data: {
    //     chain_id: chain.chain_id,
    //     deadline: log.arg,
    //     destination_chain_selector: log.destinationChainSelector,
    //     filler: log.filler,
    //     order_id: log.orderId,
    //     order_status: order_status.Created,
    //     primary_filler_deadline: log.primaryFillerDeadline,
    //     source_chain_selector: log.sourceChainSelector,
    //     sponsored: log.sponsored,
    //     user: log.user,
    //     call_data: log.callData,
    //     call_recipient: log.callRecipient,
    //   },
    //   select: { id: true },
    // });

    const exists = await this.prismaService.block_checkpoint.findFirst({
      where: { height: log.blockNumber, chain_id: chain.chain_id },
    });
    if (!exists) {
      await this.prismaService.block_checkpoint.create({
        data: {
          chain_id: chain.chain_id,
          height: log.blockNumber,
        },
      });
    }

    // TODO FIXME Emit to Filler
  }
}
