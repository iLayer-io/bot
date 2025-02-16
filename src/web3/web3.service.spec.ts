import { Test, TestingModule } from '@nestjs/testing';
import { Web3Service } from './web3.service.js';
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
});
