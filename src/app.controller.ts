import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateOrderDto, CreateOrderRequestDto, FillOrderDto, LzReceiveDto, WithdrawOrderDto, ZeroxSwapDto } from './dto/contracts.dto';
import { AppService } from './app.service';
import { ContractsService } from './contracts/contracts.service';
import { ZeroxService } from './zerox/zerox.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
    private readonly contractsService: ContractsService,
    private readonly zeroxService: ZeroxService,
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

}