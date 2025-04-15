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
