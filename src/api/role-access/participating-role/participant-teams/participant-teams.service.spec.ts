import { Test, TestingModule } from '@nestjs/testing';
import { ParticipantTeamsService } from './participant-teams.service';

describe('ParticipantTeamsService', () => {
  let service: ParticipantTeamsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParticipantTeamsService],
    }).compile();

    service = module.get<ParticipantTeamsService>(ParticipantTeamsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
