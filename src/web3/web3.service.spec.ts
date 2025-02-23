import { Test, TestingModule } from '@nestjs/testing';
import { TToken, Web3Service } from './web3.service.js';
import { CustomConfigModule } from '../config/config.module.js';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

describe('ViemService', () => {
  let service: Web3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CustomConfigModule],
      providers: [Web3Service],
    }).compile();

    service = module.get<Web3Service>(Web3Service);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
    const result = await service.getBlockNumber('Foundry');
    const res = await service.getBlockBatch('Foundry', [27n]);
    res.forEach((r) => {
      console.log(r);
    });
    expect(result).toBe(27n);
  });

  it('should get logs', async () => {
    const res = await service.getBlockBatchOrderHubLogs({
      chainName: 'Foundry',
      fromBlock: 0n,
      toBlock: 100n,
    });
    res.forEach((r) => {
      console.log(r);
    });
  });

  it('should log addresses', async () => {
    const walletClient = createWalletClient({
      transport: http('http://127.0.0.1:8545'),
      account: privateKeyToAccount(
        '0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6',
      ),
    });

    const addresses = await walletClient.getAddresses();
    console.log(addresses);
  });

  it('should read a contract', async () => {
    const result = await service.getBalance({
      chainName: 'Foundry',
      symbol: 'USDC',
    });

    expect(result).toBe(0n);
  });

  it('should hash a token', async () => {
    const result = service.hashTokenStruct({
      amount: 10n ** 18n,
      tokenAddress: '0x8ce361602b935680e8dec218b820ff5056beb7af',
      tokenId: 0n,
      tokenType: 1,
    });

    expect(result).toBe(
      '0x859e0cd1788b7f6fd5eda39c624f4644103d38121fe9e9d35b8631da12a639c8',
    );
  });

  it('should hash a token array', async () => {
    const result = service.hashTokenArray([
      {
        amount: 10n ** 18n,
        tokenAddress: '0x8ce361602B935680E8DeC218b820ff5056BeB7af',
        tokenId: 0n,
        tokenType: 1,
      },
      {
        amount: 5n * 10n ** 18n,
        tokenAddress: '0xe1Aa25618fA0c7A1CFDab5d6B456af611873b629',
        tokenId: 0n,
        tokenType: 1,
      },
    ]);

    expect(result).toBe(
      '0x239f3540b073b62c0850901eaa3b0bec2c4b07a03c16be6768b9dde41c23bf0b',
    );
  });

  it('should hash an order', async () => {
    const tokens: TToken[] = [
      {
        amount: 10n ** 18n,
        tokenAddress: '0x8ce361602B935680E8DeC218b820ff5056BeB7af',
        tokenId: 0n,
        tokenType: 1,
      },
      {
        amount: 5n * 10n ** 18n,
        tokenAddress: '0xe1Aa25618fA0c7A1CFDab5d6B456af611873b629',
        tokenId: 0n,
        tokenType: 1,
      },
    ];

    const result = service.hashOrder({
      callData: '0x',
      callRecipient:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      deadline: 1n,
      primaryFillerDeadline: 0n,
      destinationChainEid: 2,
      sourceChainEid: 1,
      inputs: tokens,
      outputs: tokens,
      sponsored: false,
      user: '0x000000000000000000000000a0ee7a142d267c1f36714e4a8f75612f20a79720',
      filler:
        '0x00000000000000000000000023618e81e3f5cdf7f54c3d65f7fbc0abf5b21e8f',
    });

    expect(result).toBe(
      '0x5345a2fe942ece9e0d43e01d0958ee3442970210e70a92f5e2ca562250456c2b',
    );
  });
});
