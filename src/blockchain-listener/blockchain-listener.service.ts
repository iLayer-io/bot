import { Injectable, OnModuleInit } from '@nestjs/common';
import { BotChain, CustomConfigService } from '../config/config.service.js';
import {
  OrderCreatedEvent,
  OrderFilledEvent,
  OrderHubLog,
  OrderSettledEvent,
  OrderSpokeLog,
  OrderWithdrawnEvent,
  Web3Service,
} from '../web3/web3.service.js';
import { PrismaService } from '../prisma.service.js';
import { Logger } from '@nestjs/common';

@Injectable()
export class BlockchainListenerService implements OnModuleInit {
  // TODO FIXME Refactor this whole service
  private readonly logger = new Logger(BlockchainListenerService.name);

  constructor(
    private readonly configService: CustomConfigService,
    private readonly web3Service: Web3Service,
    private readonly prismaService: PrismaService,
  ) {}

  onModuleInit() {
    this.initializeListener().catch((error) => {
      console.error(error);
    });
  }

  private async initializeListener() {
    const promises = this.configService.botConfig.chain.map(async (chain) => {
      await this.initializeChainListener(chain);
    });
    await Promise.any(promises);
  }

  private async initializeChainListener(chain: BotChain) {
    const lastCheckpoint = await this.prismaService.block_checkpoint.findFirst({
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

    // We take config.start_block only if there is no saved checkpoint.
    // We throw an error if the checkpoint is less than the configured starting block.
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
    const latestBlock = await this.web3Service.getBlockNumber(chain.name);
    let toBlock =
      latestBlock - fromBlock > BigInt(chain.block_batch_size)
        ? fromBlock + BigInt(chain.block_batch_size)
        : latestBlock;

    while (toBlock > fromBlock) {
      // TODO FIXME filter both OrderHub and OrderSpoke logs
      const logs = await this.web3Service.getBlockBatchOrderHubLogs({
        chainName: chain.name,
        fromBlock: fromBlock,
        toBlock: toBlock,
      });

      for (const log of logs) {
        await this.handleOrderLog({ log, chain });
        fromBlock = log.blockNumber + 1n; // NB. we can do +1 here because we're working with blocks
      }

      // TODO FIXME replace with upsert
      const exists = await this.prismaService.block_checkpoint.findFirst({
        where: { height: fromBlock, chain_id: chain.chain_id },
      });
      if (!exists) {
        await this.prismaService.block_checkpoint.create({
          data: {
            chain_id: chain.chain_id,
            height: fromBlock,
          },
        });
      }

      const latestBlock = await this.web3Service.getBlockNumber(chain.name);
      toBlock =
        latestBlock - fromBlock > BigInt(chain.block_batch_size)
          ? fromBlock + BigInt(chain.block_batch_size)
          : latestBlock;
    }

    this.logger.log({
      message: `Starting listener`,
      chain: chain.name,
      fromBlock: fromBlock,
    });

    await this.web3Service.watcOrderHubLogs({
      chainName: chain.name,
      fromBlock: fromBlock,
      onLog: async (log) => {
        await this.handleOrderLog({ log, chain });
      },
    });

    await this.web3Service.watcOrderSpokeLogs({
      chainName: chain.name,
      fromBlock: fromBlock,
      onLog: async (log) => {
        await this.handleOrderSpokeLog({ log, chain });
      },
    });
  }

  private async handleOrderLog({
    log,
    chain,
  }: {
    log: OrderHubLog | OrderSpokeLog;
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
      default: {
        this.logger.warn({
          message: 'Unknown log',
          logName: log.eventName,
        });
      }
    }

    // TODO FIXME replace with upsert
    const exists = await this.prismaService.block_checkpoint.findFirst({
      // NB. we can't do +1 here because we're working with single logs
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

  private async handleOrderSpokeLog({
    log,
    chain,
  }: {
    log: OrderSpokeLog;
    chain: BotChain;
  }) {
    this.logger.log({ message: 'handling log', log });
    switch (log.eventName) {
      case 'OrderFilled': {
        await this.handleOrderFilled({ log: log as OrderFilledEvent, chain });
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
      // TODO Check wheter it is appropriate to slice(2) every address
      Buffer.from(log.args.calller!.slice(2), 'hex'),
    );

    const existingOrder = await this.prismaService.order.findFirst({
      where: {
        chain_id: chain.chain_id,
        order_id: orderId, // TODO FIXME modify order_id to be a primary key
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
    const orderId = new Uint8Array(
      Buffer.from(log.args.orderId!.slice(2), 'hex'),
    );

    const existingOrder = await this.prismaService.order.findFirst({
      where: {
        chain_id: chain.chain_id,
        order_id: orderId,
      },
    });

    if (!existingOrder) {
      this.logger.warn({
        message: 'Order Withdrawn doesnt exists',
        orderId: Buffer.from(orderId).toString('hex'),
        chainId: chain.chain_id,
      });
      return;
    }

    await this.prismaService.order.update({
      data: {
        order_status: 'Withdrawn',
      },
      where: {
        id: existingOrder.id,
      },
    });
  }

  private async handleOrderSettled({
    log,
    chain,
  }: {
    log: OrderSettledEvent;
    chain: BotChain;
  }) {
    const orderId = new Uint8Array(
      Buffer.from(log.args.orderId!.slice(2), 'hex'),
    );

    const existingOrder = await this.prismaService.order.findFirst({
      where: {
        chain_id: chain.chain_id,
        order_id: orderId,
      },
    });

    if (!existingOrder) {
      this.logger.warn({
        message: 'Order Settled doesnt exists',
        orderId: Buffer.from(orderId).toString('hex'),
        chainId: chain.chain_id,
      });
      return;
    }

    await this.prismaService.order.update({
      data: {
        order_status: 'Filled',
      },
      where: {
        id: existingOrder.id,
      },
    });
  }

  private async handleOrderFilled({
    log,
    chain,
  }: {
    log: OrderFilledEvent;
    chain: BotChain;
  }) {
    const orderId = new Uint8Array(
      Buffer.from(log.args.orderId!.slice(2), 'hex'),
    );

    const existingOrder = await this.prismaService.order.findFirst({
      where: {
        chain_id: chain.chain_id,
        order_id: orderId,
      },
    });

    if (!existingOrder) {
      this.logger.warn({
        message: 'Order Filled doesnt exists',
        orderId: Buffer.from(orderId).toString('hex'),
        chainId: chain.chain_id,
      });
      return;
    }

    await this.prismaService.order.update({
      data: {
        order_status: 'Filled',
      },
      where: {
        id: existingOrder.id,
      },
    });
  }
}
