import { Injectable, Logger } from '@nestjs/common';
import { Web3Service } from '../web3/web3.service.js';
import { BotChain } from '../config/config.service.js';
import { order } from '@prisma/client';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class BlockchainFillerService {
  private readonly logger = new Logger(BlockchainFillerService.name);

  constructor(
    private readonly web3Service: Web3Service,
    private readonly prismaService: PrismaService,
  ) {}

  async fillOrder(chain: BotChain, order: order) {
    this.logger.log(`Filling order ${order.id} on chain ${chain.name}`);
    // TODO FIXME Check that we are the designated filler, primary and secondary deadline,
    //  check that we've the right amount of tokens
    // NB. we don't need to manage order status here,
    //  because we have events coming back from the blockchain that will update the order status and cause eventual consistency
  }
}
// TODO baseline of the fill method
