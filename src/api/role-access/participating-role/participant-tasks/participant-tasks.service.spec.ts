import { Test, TestingModule } from '@nestjs/testing';
import { ParticipantTasksService } from './participant-tasks.service';

describe('ParticipantTasksService', () => {
  let service: ParticipantTasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParticipantTasksService],
    }).compile();

    service = module.get<ParticipantTasksService>(ParticipantTasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
