import { Test, TestingModule } from '@nestjs/testing';
import { ParticipantTeamsController } from './participant-teams.controller';
import { ParticipantTeamsService } from './participant-teams.service';

describe('ParticipantTeamsController', () => {
  let controller: ParticipantTeamsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParticipantTeamsController],
      providers: [ParticipantTeamsService],
    }).compile();

    controller = module.get<ParticipantTeamsController>(ParticipantTeamsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
