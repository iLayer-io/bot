import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseWatcherService } from './database-watcher.service';

describe('DatabaseWatcherService', () => {
  let service: DatabaseWatcherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseWatcherService],
    }).compile();

    service = module.get<DatabaseWatcherService>(DatabaseWatcherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
