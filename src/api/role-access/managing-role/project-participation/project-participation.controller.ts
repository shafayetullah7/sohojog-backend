import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectParticipationService } from './project-participation.service';
import { Roles } from 'src/shared/custom-decorator/roles.decorator';
import { Role } from 'src/constants/enums/user.roles';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { TokenValidationGuard } from 'src/shared/guards/token.validation.guard';
import { JwtAuthGaurd } from 'src/shared/guards/jwt.auth.gaurd';
import { ZodValidation } from 'src/shared/custom-decorator/zod.validation.decorator';
import {
  ProjectParticipationQueryDto,
  projectParticipationQuerySchema,
} from './dto/project.participation.query.dto';
import { User } from 'src/shared/custom-decorator/user.decorator';
import { JwtUser } from 'src/constants/interfaces/req-user/jwt.user';
import {
  ProjectParticipationUpdateDto,
  ProjectParticipationUpdateParamDto,
  projectParticipationUpdateParamSchema,
  projectParticipationUpdatePayloadSchema,
} from './dto/project.participation.update.dto';

@Controller('manager/project-participations')
export class ProjectParticipationController {
  constructor(
    private readonly projectParticipationService: ProjectParticipationService,
  ) {}

  @Get()
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async getProjectParticipation(
    @Query(ZodValidation(projectParticipationQuerySchema))
    query: ProjectParticipationQueryDto,
    @User() user: JwtUser,
  ) {
    const result =
      await this.projectParticipationService.getProjectParticipations(
        user.userId,
        query,
      );

    return result;
  }

  @Patch('/:participationId')
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async updateProjectParticipation(
    @Body(ZodValidation(projectParticipationUpdatePayloadSchema))
    payload: ProjectParticipationUpdateDto,
    @Param(ZodValidation(projectParticipationUpdateParamSchema))
    param: ProjectParticipationUpdateParamDto,
    @User() user: JwtUser,
  ) {
    const { participationId } = param;
    const result =
      await this.projectParticipationService.updateProjectParticipations(
        user.userId,
        participationId,
        payload,
      );

    return result;
  }
}
