import { Test, TestingModule } from '@nestjs/testing';
import { ParticipantProjectController } from './participant-project.controller';
import { ParticipantProjectService } from './participant-project.service';

describe('ParticipantProjectController', () => {
  let controller: ParticipantProjectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParticipantProjectController],
      providers: [ParticipantProjectService],
    }).compile();

    controller = module.get<ParticipantProjectController>(ParticipantProjectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
