import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateOrderDto, CreateOrderRequestDto, FillOrderDto, LzReceiveDto, WithdrawOrderDto } from './dto/contracts.dto';
import { AppService } from './app.service';
import { ContractsService } from './contracts/contracts.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
    private readonly contractsService: ContractsService,
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('contracts/fill-order')
  fill(@Body() dto: FillOrderDto) {
    return dto;
  }

  @Post('orders/create-simple')
  createSimple(@Body() dto: CreateOrderRequestDto) {
    const chains = this.configService.get<any[]>('chains');

    if (!chains) {
      throw new Error(`No chain at all found in configuration!`);
    }

    const sourceChainConfig = chains.find(
      (chain) => chain.name.toLowerCase() === dto.sourceChain.toLowerCase(),
    );

    const destinationChainConfig = chains.find(
      (chain) => chain.name.toLowerCase() === dto.destinationChain.toLowerCase(),
    );

    if (!sourceChainConfig) {
      return {
        msg: `Source chain ${dto.sourceChain} not found in configuration`,
        chain: null,
      }
    }

    if (!destinationChainConfig) {
      return {
        msg: `Destination chain ${dto.destinationChain} not found in configuration`,
        chain: null,
      }
    }

    const inputTokenData = sourceChainConfig.tokens.find(
      (token) => token.symbol.toLowerCase() === dto.inputs[0].token.toLowerCase(),
    );

    const outputTokenData = destinationChainConfig.tokens.find(
      (token) => token.symbol.toLowerCase() === dto.outputs[0].token.toLowerCase(),
    );

    if (!inputTokenData) {
      return {
        msg: `Input token ${dto.inputs[0].token} not found in source chain configuration`,
        chain: null,
      }
    }

    if (!outputTokenData) {
      return {
        msg: `Output token ${dto.outputs[0].token} not found in destination chain configuration`,
        chain: null,
      }
    }

    return {
      msg: 'Config loaded',
      chain: inputTokenData,
    };
  }

  @Get('test-block')
  async getBlockNumber() {
    const block = await this.contractsService.testConnection();
    return { block };
  }

  @Post('contracts/create-order/:chain')
  async callCreateOrder(
    @Param('chain') chain: string,
    @Body() dto: CreateOrderDto
  ) {
    return await this.contractsService.createOrder(dto, chain);
  }

  @Post('orders/withdraw/:chain')
  withdrawOrder(
    @Param('chain') chain: string,
    @Body() dto: WithdrawOrderDto
  ) {
    return this.contractsService.withdrawOrder(dto, chain);
  }

  @Post('orders/fill/:chain')
  fillOrder(
    @Param('chain') chain: string,
    @Body() dto: FillOrderDto
  ) {
    return this.contractsService.fillOrder(dto, chain);
  }

  @Get('orders')
  async getAllOrders() {
    return this.contractsService.getAllOrders();
  }

  @Post('lz/receive/:chain')
  lzReceive(
    @Param('chain') chain: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.contractsService.lzReceive(dto, chain);
  }

}