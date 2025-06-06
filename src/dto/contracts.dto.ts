import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
  ValidateNested
} from 'class-validator';
import { Type as TransformType } from 'class-transformer';

export enum TokenType {
  NULL = 0,
  NATIVE = 1,
  ERC20 = 2,
  ERC721 = 3,
  ERC1155 = 4,
}

export class TokenDto {
  @ApiProperty({ enum: TokenType })
  @IsEnum(TokenType)
  tokenType: TokenType;

  @ApiProperty()
  @IsString()
  tokenAddress: string;  // bytes32 hex string

  @ApiProperty()
  @IsNumber()
  tokenId: number;

  @ApiProperty()
  @IsNumber()
  amount: number;
}

export class OrderDto {
  @ApiProperty()
  @IsString()
  user: string; // bytes32 hex string

  @ApiProperty()
  @IsString()
  recipient: string; // bytes32 hex string

  @ApiProperty()
  @IsString()
  filler: string; // bytes32 hex string

  @ApiProperty({ type: [TokenDto] })
  @ValidateNested({ each: true })
  @IsArray()
  @TransformType(() => TokenDto)
  inputs: TokenDto[];

  @ApiProperty({ type: [TokenDto] })
  @ValidateNested({ each: true })
  @IsArray()
  @TransformType(() => TokenDto)
  outputs: TokenDto[];

  @ApiProperty()
  @IsNumber()
  sourceChainEid: number;

  @ApiProperty()
  @IsNumber()
  destinationChainEid: number;

  @ApiProperty()
  @IsBoolean()
  sponsored: boolean;

  @ApiProperty()
  @IsNumber()
  primaryFillerDeadline: number;

  @ApiProperty()
  @IsNumber()
  deadline: number;

  @ApiProperty()
  @IsString()
  callRecipient: string; // bytes32 hex string

  @ApiProperty()
  @IsString()
  callData: string; // bytes hex string

  @ApiProperty()
  @IsNumber()
  callValue: number;
}

export class OrderRequestDto {
  @ApiProperty()
  @IsNumber()
  deadline: number;

  @ApiProperty()
  @IsNumber()
  nonce: number;

  @ApiProperty()
  @ValidateNested()
  @TransformType(() => OrderDto)
  order: OrderDto;
}

export class CreateOrderDto {
  @ApiProperty({ type: OrderRequestDto })
  @ValidateNested()
  @TransformType(() => OrderRequestDto)
  request: OrderRequestDto;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  permits: string[];

  @ApiProperty()
  @IsString()
  signature: string;

  @ApiProperty()
  @IsString()
  options: string;
}

export class WithdrawOrderDto {
  @ApiProperty({ type: OrderDto })
  @ValidateNested()
  @TransformType(() => OrderDto)
  order: OrderDto;

  @ApiProperty()
  @IsNumber()
  orderNonce: number;
}

export class FillOrderDto {
  @ApiProperty({ type: OrderDto })
  @ValidateNested()
  @TransformType(() => OrderDto)
  order: OrderDto;

  @ApiProperty()
  @IsNumber()
  orderNonce: number;

  @ApiProperty()
  @IsString()
  fundingWallet: string; // bytes32 hex string

  @ApiProperty()
  @IsNumber()
  maxGas: number;

  @ApiProperty()
  @IsString()
  options: string; // hex string representing bytes
}

export class TokenIORequestDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsNumber()
  amount: number;
}

export class CreateOrderRequestDto {
  @ApiProperty()
  @IsString()
  user: string;

  @ApiProperty()
  @IsString()
  recipient: string;

  @ApiProperty()
  @IsString()
  filler: string;

  @ApiProperty({ type: [TokenIORequestDto] })
  @ValidateNested({ each: true })
  @TransformType(() => TokenIORequestDto)
  @IsArray()
  inputs: TokenIORequestDto[];

  @ApiProperty({ type: [TokenIORequestDto] })
  @ValidateNested({ each: true })
  @TransformType(() => TokenIORequestDto)
  @IsArray()
  outputs: TokenIORequestDto[];

  @ApiProperty()
  @IsString()
  sourceChain: string;

  @ApiProperty()
  @IsString()
  destinationChain: string;
}

export class OriginDto {
  @IsNumber()
  srcEid: number;

  @IsString()
  sender: string;

  @IsString()
  nonce: string;
}

export class LzReceiveDto {
  @ValidateNested()
  @TransformType(() => OriginDto)
  origin: OriginDto;

  @IsString()
  guid: string;

  @IsString()
  message: string;

  @IsString()
  executor: string;

  @IsString()
  extraData: string;
}

export class ZeroxSwapDto {
  @ApiProperty({ description: 'The address of the token to buy' })
  @IsString()
  buyTokenName: string;

  @ApiProperty({ description: 'The address of the token to sell' })
  @IsString()
  sellTokenName: string;

  @ApiProperty({ description: 'The amount to sell (in wei or token base units)' })
  @IsString()
  sellAmount: string;

  @ApiProperty({ description: 'Chain name for the swap (e.g. Ethereum, Arbitrum)' })
  @IsString()
  chainName: string;

  @ApiProperty({ description: 'Taker address (the one initiating the swap)' })
  @IsString()
  taker: string;
}

export class RFQDto {
  @ApiProperty({ description: 'The address of the token to buy' })
  @IsString()
  buyTokenName: string;
  @ApiProperty({ description: 'The address of the token to sell' })
  @IsString()
  sellTokenName: string;
  @ApiProperty({ description: 'The amount to sell (in wei or token base units)' })
  @IsString()
  sellAmount: string;
  @ApiProperty({ description: 'Chain name for the RFQ (e.g. Ethereum, Arbitrum)' })
  @IsString()
  chainName: string;
}

export class SwapAndFillDto {
  @ApiProperty({ type: ZeroxSwapDto })
  @ValidateNested()
  @TransformType(() => ZeroxSwapDto)
  swap: ZeroxSwapDto;

  @ApiProperty({ type: FillOrderDto })
  @ValidateNested()
  @TransformType(() => FillOrderDto)
  fill: FillOrderDto;
}