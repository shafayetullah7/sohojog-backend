import { Test, TestingModule } from '@nestjs/testing';
import { ParticipantTasksController } from './participant-tasks.controller';
import { ParticipantTasksService } from './participant-tasks.service';

describe('ParticipantTasksController', () => {
  let controller: ParticipantTasksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParticipantTasksController],
      providers: [ParticipantTasksService],
    }).compile();

    controller = module.get<ParticipantTasksController>(ParticipantTasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
