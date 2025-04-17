import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

import { ContractsService } from './contracts/contracts.service';
import { ZeroxService } from './zerox/zerox.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, ContractsService, ZeroxService, PrismaService],
  exports: [PrismaService],
})
export class AppModule { }
