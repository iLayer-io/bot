import { Test, TestingModule } from '@nestjs/testing';
import { CustomConfigService } from './config.service.js';

describe('ConfigService', () => {
  let service: CustomConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomConfigService],
    }).compile();

    service = module.get<CustomConfigService>(CustomConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
