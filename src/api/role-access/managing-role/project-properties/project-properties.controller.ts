import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ProjectPropertiesService } from './project-properties.service';
import { Roles } from 'src/shared/custom-decorator/roles.decorator';
import { Role } from 'src/constants/enums/user.roles';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { JwtAuthGaurd } from 'src/shared/guards/jwt.auth.gaurd';
import { TokenValidationGuard } from 'src/shared/guards/token.validation.guard';
import { ZodValidation } from 'src/shared/custom-decorator/zod.validation.decorator';
import {
  GetProjectTeamDto,
  getProjectTeamSchema,
} from './dto/get.project.team.dto';
import { User } from 'src/shared/custom-decorator/user.decorator';
import { JwtUser } from 'src/constants/interfaces/req-user/jwt.user';

@Controller('manager/project-properties')
export class ProjectPropertiesController {
  constructor(
    private readonly projectPropertiesService: ProjectPropertiesService,
  ) {}

  @Get('/:projectId/teams/:teamId')
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async getSingleProjectTeam(
    @Param(ZodValidation(getProjectTeamSchema)) param: GetProjectTeamDto,
    @User() user: JwtUser,
  ) {
    const { userId } = user;
    const result = await this.projectPropertiesService.getSingleProjectTeam(
      user.userId,
      param.projectId,
      param.teamId,
    );

    return result
  }
}
