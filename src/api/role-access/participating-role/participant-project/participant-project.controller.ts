import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ParticipantProjectService } from './participant-project.service';
import { Roles } from 'src/shared/custom-decorator/roles.decorator';
import { Role } from 'src/constants/enums/user.roles';
import { JwtAuthGaurd } from 'src/shared/guards/jwt.auth.gaurd';
import { TokenValidationGuard } from 'src/shared/guards/token.validation.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { User } from 'src/shared/custom-decorator/user.decorator';
import { JwtUser } from 'src/constants/interfaces/req-user/jwt.user';
import { ZodValidation } from 'src/shared/custom-decorator/zod.validation.decorator';
import {
  GetSingleProjectDto,
  getSingleProjectSchema,
} from './dto/get.single.project.dto';

@Controller('participations')
export class ParticipantProjectController {
  constructor(
    private readonly participantProjectService: ParticipantProjectService,
  ) {}

  @Get()
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async getMyProjects(
    // @Query(ZodValidation(getMyProjectsQuerySchema))
    // query: GetMyProjectsQueryDto,
    @User() user: JwtUser,
  ) {
    const result = await this.participantProjectService.getProjects(
      user.userId,
    );
    return result;
  }

  @Get('/:participationId')
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async getSingleProject(
    @Param(ZodValidation(getSingleProjectSchema))
    param: GetSingleProjectDto,
    @User() user: JwtUser,
  ) {
    const result = await this.participantProjectService.getSingleProject(
      user.userId,
      param.participationId,
    );
    return result;
  }
}
