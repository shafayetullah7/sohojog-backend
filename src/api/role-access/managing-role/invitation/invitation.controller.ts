import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { Roles } from 'src/shared/custom-decorator/roles.decorator';
import { Role } from 'src/constants/enums/user.roles';
import { JwtAuthGaurd } from 'src/shared/guards/jwt.auth.gaurd';
import { TokenValidationGuard } from 'src/shared/guards/token.validation.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { ZodValidation } from 'src/shared/custom-decorator/zod.validation.decorator';
import {
  CreateInvitationBodyDto,
  createInvitationBodySchema,
} from './dto/create.invitation.dto';
import { User } from 'src/shared/custom-decorator/user.decorator';
import { JwtUser } from 'src/constants/interfaces/req-user/jwt.user';
import {
  GetInvitationsQueryDto,
  getInvitationsQuerySchema,
} from './dto/get.invitation.dto';

@Controller('manager/invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post()
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async sendInvitation(
    @Body(ZodValidation(createInvitationBodySchema))
    body: CreateInvitationBodyDto,
    @User() user: JwtUser,
  ) {
    const result = await this.invitationService.sendInvitation(
      user.userId,
      body,
    );
    return result;
  }

  @Get()
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async getInvitations(
    @Body(ZodValidation(getInvitationsQuerySchema))
    body: GetInvitationsQueryDto,
    @User() user: JwtUser,
  ) {
    const result = await this.invitationService.getInvitations(
      user.userId,
      body,
    );
    return result;
  }
}
