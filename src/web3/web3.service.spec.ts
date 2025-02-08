import { Test, TestingModule } from '@nestjs/testing';
import { Web3Service } from './web3.service.js';
import { CustomConfigModule } from '../config/config.module.js';

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
});
