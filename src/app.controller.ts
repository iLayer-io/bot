import { Body, Controller, Get, Param, Post, ParseIntPipe } from '@nestjs/common';
import { CreateOrderRequestDto, FillOrderDto, WithdrawOrderDto, ZeroxSwapDto, SwapAndFillDto, RFQDto } from './dto/contracts.dto';
import { ContractsService } from './contracts/contracts.service';
import { MulticallService } from './multicall/multicall.service';
import { ZeroxService } from './zerox/zerox.service';

@Controller()
export class AppController {
  constructor(
    private readonly contractsService: ContractsService,
    private readonly zeroxService: ZeroxService,
    private readonly multicallService: MulticallService
  ) { }

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


  @Post('swap')
  async swap(
    @Body() dto: ZeroxSwapDto,
  ) {
    return this.zeroxService.swap(dto);
  }

  @Get('hub-status/:chain/:orderId')
  getOrderHubStatus(@Param('chain') chain: string, @Param('orderId') orderId: string) {
    return this.contractsService.getOrderHubStatus(orderId, chain);
  }

  @Get('spoke-status/:chain/:orderId')
  getOrderSpokeStatus(@Param('chain') chain: string, @Param('orderId') orderId: string) {
    return this.contractsService.getOrderSpokeStatus(orderId, chain);
  }

  @Post('orders/create')
  async createOrderFromRequest(@Body() dto: CreateOrderRequestDto) {
    try {
      const result = await this.contractsService.createOrderRequest(dto);
      return {
        msg: 'Order successfully created',
        txHash: result.hash,
      };
    } catch (error) {
      console.error('Error creating order from request DTO:', error);
      return {
        msg: 'Order creation failed',
        error: error.message,
      };
    }
  }

  @Post('swap-and-fill')
  async swapAndFill(@Body() body: SwapAndFillDto) {
    return this.multicallService.swapAndFillUsingExecutor(body.swap, body.fill);
  }

  @Post('rfq')
  async rfq(@Body() dto: RFQDto) {
    return this.zeroxService.rfq(dto);
  }

  @Get('fillFromDb/:chain/:nonce')
  async fillOrderFromDb(
    @Param('chain') chain: string,
    @Param('nonce', ParseIntPipe) nonce: number
  ) {
    const result = await this.contractsService.fillOrderFromDb(nonce, chain);
    return { status: 'success', result };
  }


  @Get('withdrawFromDb/:chain/:nonce')
  async withdrawOrderFromDb(
    @Param('chain') chain: string,
    @Param('nonce', ParseIntPipe) nonce: number
  ) {
    const result = await this.contractsService.withdrawOrderFromDb(nonce, chain);
    return { status: 'success', result };
  }

  @Get('orderHubStatusFromDb/:chain/:nonce')
  async getOrderHubStatusFromDb(
    @Param('chain') chain: string,
    @Param('nonce', ParseIntPipe) nonce: number
  ) {
    const result = await this.contractsService.orderHubStatusFromDb(nonce, chain);
    return { status: 'success', result };
  }
  @Get('orderSpokeStatusFromDb/:chain/:nonce')
  async getOrderSpokeStatusFromDb(
    @Param('chain') chain: string,
    @Param('nonce', ParseIntPipe) nonce: number
  ) {
    const result = await this.contractsService.orderSpokeStatusFromDb(nonce, chain);
    return { status: 'success', result };
  }

  @Get('listenToOrderCreated/:chain')
  async listenToOrderCreated(
    @Param('chain') chain: string
  ) {
    try {
      const result = await this.contractsService.listenToOrderCreated(chain);
      return { status: 'success', result };
    } catch (error) {
      console.error('Error listening to order created events:', error);
      return { status: 'error', message: error.message };
    }
  }
}