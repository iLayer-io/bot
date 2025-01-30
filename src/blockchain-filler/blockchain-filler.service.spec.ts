import { Test, TestingModule } from '@nestjs/testing';
import { BlockchainFillerService } from './blockchain-filler.service';

describe('BlockchainFillerService', () => {
  let service: BlockchainFillerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockchainFillerService],
    }).compile();

    service = module.get<BlockchainFillerService>(BlockchainFillerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
