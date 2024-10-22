import { Controller, Post, UseInterceptors } from '@nestjs/common';
import { ManagerTaskService } from './manager-task.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('manager/tasks')
export class ManagerTaskController {
  constructor(private readonly managerTaskService: ManagerTaskService) {}

  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async createTask(){

  }
}
