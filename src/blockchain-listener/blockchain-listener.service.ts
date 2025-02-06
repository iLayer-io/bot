import { Injectable, OnModuleInit } from '@nestjs/common';
import { BotChain, CustomConfigService } from '../config/config.service.js';
import {
  OrderCreatedEvent,
  OrderHubLog,
  OrderSettledEvent,
  OrderWithdrawnEvent,
  ViemService,
} from '../viem/viem.service.js';
import { PrismaService } from '../prisma.service.js';
import { Logger } from '@nestjs/common';
import { Log } from 'viem';

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
        fromBlock: 0n,
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
    this.logger.log({ message: 'handling log', log });
    switch (log.eventName) {
      case 'OrderCreated': {
        await this.handleOrderCreated({ log: log as OrderCreatedEvent, chain });
        break;
      }
      case 'OrderWithdrawn': {
        await this.handleOrderWithdrawn({
          log: log as OrderWithdrawnEvent,
          chain,
        });
        break;
      }
      case 'OrderSettled': {
        await this.handleOrderSettled({ log: log as OrderSettledEvent, chain });
        break;
      }
    }

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
  }

  private async handleOrderCreated({
    log,
    chain,
  }: {
    log: OrderCreatedEvent;
    chain: BotChain;
  }) {
    this.logger.log({ message: 'event created', log });
    // TODO Create if it doesnt exists
    const deadline_number = Number(log.args.order!.deadline);
    const deadline = new Date(deadline_number);

    const primary_filler_deadline_number = Number(
      log.args.order!.primaryFillerDeadline,
    );
    const primary_filler_deadline = new Date(primary_filler_deadline_number);

    const filler = new Uint8Array(
      Buffer.from(log.args.order!.filler.slice(2), 'hex'),
    );

    const orderId = new Uint8Array(
      Buffer.from(log.args.orderId!.slice(2), 'hex'),
    );

    const callData = new Uint8Array(
      Buffer.from(log.args.order!.callData.slice(2), 'hex'),
    );

    const callRecipient = new Uint8Array(
      Buffer.from(log.args.order!.callRecipient.slice(2), 'hex'),
    );

    const calller = new Uint8Array(
      Buffer.from(log.args.calller!.slice(2), 'hex'),
    );

    const existingOrder = await this.prismaService.order.findFirst({
      where: {
        chain_id: chain.chain_id,
        order_id: orderId,
      },
    });

    if (existingOrder) {
      this.logger.log({
        message: 'Order already exists',
        orderId: Buffer.from(orderId).toString('hex'),
        chainId: chain.chain_id,
      });
      return;
    }

    // TODO FIXME best practice lower or camel for prisma?
    await this.prismaService.order.create({
      data: {
        chain_id: chain.chain_id,
        deadline: deadline,
        destination_chain_selector: log.args.order!.destinationChainEid,
        source_chain_selector: log.args.order!.sourceChainEid,
        filler: filler,
        order_id: orderId,
        order_status: 'Created',
        primary_filler_deadline: primary_filler_deadline,
        sponsored: log.args.order!.sponsored,
        call_data: callData,
        call_recipient: callRecipient,
        user: calller,
      },
      select: { id: true },
    });

    this.logger.log({
      message: 'Order created!',
      orderId: Buffer.from(orderId).toString('hex'),
      chainId: chain.chain_id,
    });
  }

  private async handleOrderWithdrawn({
    log,
    chain,
  }: {
    log: OrderWithdrawnEvent;
    chain: BotChain;
  }) {
    // TODO find by chain_id and order_id and update status
  }

  private async handleOrderSettled({
    log,
    chain,
  }: {
    log: OrderSettledEvent;
    chain: BotChain;
  }) {
    // TODO find by chain_id and order_id and update status
  }
}
