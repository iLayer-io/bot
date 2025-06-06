import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import configuration from './config/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service'
import { MulticallService } from './multicall/multicall.service';
import { ContractsService } from './contracts/contracts.service';
import { ZeroxService } from './zerox/zerox.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    TerminusModule.forRoot({
      logger: false,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, ContractsService, ZeroxService, PrismaService, MulticallService],
  exports: [PrismaService],
})
export class AppModule { }
