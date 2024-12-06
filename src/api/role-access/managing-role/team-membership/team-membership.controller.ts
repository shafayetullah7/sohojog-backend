import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TeamMembershipService } from './team-membership.service';
import { Roles } from 'src/shared/custom-decorator/roles.decorator';
import { Role } from 'src/constants/enums/user.roles';
import { JwtAuthGaurd } from 'src/shared/guards/jwt.auth.gaurd';
import { TokenValidationGuard } from 'src/shared/guards/token.validation.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { ZodValidation } from 'src/shared/custom-decorator/zod.validation.decorator';
import { CreateTeamMembershipDto, createTeamMembershipSchema } from './dto/create.team.membership.dto';
import { User } from 'src/shared/custom-decorator/user.decorator';
import { JwtUser } from 'src/constants/interfaces/req-user/jwt.user';

@Controller('manager/team-membership')
export class TeamMembershipController {
  constructor(private readonly teamMembershipService: TeamMembershipService) {}

  @Post()
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async createTeamMembership(
    @Body(ZodValidation(createTeamMembershipSchema))
    body: CreateTeamMembershipDto,
    @User() user: JwtUser,
  ) {
    const result = await this.teamMembershipService.createTeamMembership(
      user.userId,
      body,
    );

    return result;
  }
}
