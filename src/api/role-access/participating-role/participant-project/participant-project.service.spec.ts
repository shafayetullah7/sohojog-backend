import { Test, TestingModule } from '@nestjs/testing';
import { ParticipantProjectService } from './participant-project.service';

describe('ParticipantProjectService', () => {
  let service: ParticipantProjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParticipantProjectService],
    }).compile();

    service = module.get<ParticipantProjectService>(ParticipantProjectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
