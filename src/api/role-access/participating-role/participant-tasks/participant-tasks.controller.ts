import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ParticipantTasksService } from './participant-tasks.service';
import { Roles } from 'src/shared/custom-decorator/roles.decorator';
import { Role } from 'src/constants/enums/user.roles';
import { JwtAuthGaurd } from 'src/shared/guards/jwt.auth.gaurd';
import { TokenValidationGuard } from 'src/shared/guards/token.validation.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { User } from 'src/shared/custom-decorator/user.decorator';
import { JwtUser } from 'src/constants/interfaces/req-user/jwt.user';
import { ZodValidation } from 'src/shared/custom-decorator/zod.validation.decorator';
import { QueryTaskDto, queryTaskSchema } from './dto/get.participant.tasks.dto';
import {
  GetSingleTaskParamsDto,
  getSingleTaskParamsSchema,
} from './dto/get.single.task.dto';

@Controller('participant/tasks')
export class ParticipantTasksController {
  constructor(
    private readonly participantTasksService: ParticipantTasksService,
  ) {}

  @Get()
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async getMyProjects(
    @Query(ZodValidation(queryTaskSchema))
    query: QueryTaskDto,
    @User() user: JwtUser,
  ) {
    const result = await this.participantTasksService.getParticipantTasks(
      user.userId,
      query,
    );
    return result;
  }

  @Get('/:id')
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async getSingleProject(
    @Param(ZodValidation(getSingleTaskParamsSchema))
    param: GetSingleTaskParamsDto,
    @User() user: JwtUser,
  ) {
    const result = await this.participantTasksService.getSingleTask(
      user.userId,
      param.id,
    );
    return result;
  }
}
