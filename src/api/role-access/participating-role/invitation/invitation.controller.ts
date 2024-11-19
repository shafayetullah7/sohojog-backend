import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { Roles } from 'src/shared/custom-decorator/roles.decorator';
import { Role } from 'src/constants/enums/user.roles';
import { JwtAuthGaurd } from 'src/shared/guards/jwt.auth.gaurd';
import { TokenValidationGuard } from 'src/shared/guards/token.validation.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { ZodValidation } from 'src/shared/custom-decorator/zod.validation.decorator';
import {
  GetInvitationsQueryDto,
  getInvitationsQuerySchema,
} from './dto/get.invittions.dto';
import { User } from 'src/shared/custom-decorator/user.decorator';
import { JwtUser } from 'src/constants/interfaces/req-user/jwt.user';
import {
  InvitationResponseBodyDto,
  invitationResponseBodySchema,
  InvitationResponseParamDto,
  invitationResponseParamSchema,
} from './dto/invitation.response.dto';
import {
  updateParticipantInvitationBody,
  UpdateParticipantInvitationBodyDto,
  updateParticipantInvitationParams,
  UpdateParticipantInvitationParamsDto,
} from './dto/update.invitation.dto';
import {
  GetSingleInvitationParamsDto,
  getSingleInvitationParamsSchema,
} from './dto/get.single.invitation.dto';

@Controller('participant/invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Get()
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async getMyProjects(
    @Query(ZodValidation(getInvitationsQuerySchema))
    query: GetInvitationsQueryDto,
    @User() user: JwtUser,
  ) {
    const result = await this.invitationService.getInvitations(
      user.userId,
      query,
    );
    return result;
  }

  @Get('/:id')
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async getSingleInvitation(
    @Param(ZodValidation(getSingleInvitationParamsSchema))
    params: GetSingleInvitationParamsDto,
    @User() user: JwtUser,
  ) {
    const result = await this.invitationService.getSingleInvitations(
      user.userId,
      params.id,
    );
    return result;
  }

  @Patch('/:id')
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async respondToInvitation(
    @Body(ZodValidation(invitationResponseBodySchema))
    body: InvitationResponseBodyDto,
    @Param(ZodValidation(invitationResponseParamSchema))
    params: InvitationResponseParamDto,
    @User() user: JwtUser,
  ) {
    const result = await this.invitationService.respondToInvitation(
      user.userId,
      params.id,
      body,
    );
    return result;
  }

  @Patch('/:id/see')
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async seeInvitation(
    @Body(ZodValidation(updateParticipantInvitationBody))
    body: UpdateParticipantInvitationBodyDto,
    @Param(ZodValidation(updateParticipantInvitationParams))
    params: UpdateParticipantInvitationParamsDto,
    @User() user: JwtUser,
  ) {
    const result = await this.invitationService.updateInvitationSeenStatus(
      user.userId,
      params.id,
      body,
    );
    return result;
  }
}
