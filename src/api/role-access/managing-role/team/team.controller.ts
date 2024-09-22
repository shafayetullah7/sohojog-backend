import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TeamService } from './team.service';
import { Roles } from 'src/shared/custom-decorator/roles.decorator';
import { Role } from 'src/constants/enums/user.roles';
import { JwtAuthGaurd } from 'src/shared/guards/jwt.auth.gaurd';
import { TokenValidationGuard } from 'src/shared/guards/token.validation.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { ZodValidation } from 'src/shared/custom-decorator/zod.validation.decorator';
import { CreateTeamBodyDto, createTeamBodySchema } from './dto/create.team.dto';
import { User } from 'src/shared/custom-decorator/user.decorator';
import { JwtUser } from 'src/constants/interfaces/req-user/jwt.user';
import { GetMyProjectTeamsQueryDto, getMyProjectTeamsQuerySchema } from './dto/get.team.dto';
import { UpdateTeamBodyDto, updateTeamBodySchema, UpdateTeamParamDto, updateTeamParamSchema } from './dto/update.team.dto';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async createTeam(
    @Body(ZodValidation(createTeamBodySchema)) body: CreateTeamBodyDto,
    @User() user: JwtUser,
  ) {
    const result = await this.teamService.createTeam(user.userId, body);
    return result;
  }

  @Get()
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async getMyTeams(
    @Query(ZodValidation(getMyProjectTeamsQuerySchema)) query: GetMyProjectTeamsQueryDto,
    @User() user: JwtUser,
  ) {
    const result = await this.teamService.getTeamsByManager(user.userId, query);
    return result;
  }

  @Patch('/:id')
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async updateMyTeam(
    @Param(ZodValidation(updateTeamParamSchema)) param: UpdateTeamParamDto,
    @Body(ZodValidation(updateTeamBodySchema)) body: UpdateTeamBodyDto,
    @User() user: JwtUser,
  ) {
    const result = await this.teamService.updateTeam(
      user.userId,
      param.id,
      body,
    );
    return result;
  }
}
