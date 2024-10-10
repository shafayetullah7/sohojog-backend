import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProjectWalletService } from './project-wallet.service';
import { Roles } from 'src/shared/custom-decorator/roles.decorator';
import { JwtAuthGaurd } from 'src/shared/guards/jwt.auth.gaurd';
import { TokenValidationGuard } from 'src/shared/guards/token.validation.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Role } from 'src/constants/enums/user.roles';
import { ZodValidation } from 'src/shared/custom-decorator/zod.validation.decorator';
import {
  CreateProjectWalletDto,
  createProjectWalletSchema,
} from './dto/create.project.wallet';
import { User } from 'src/shared/custom-decorator/user.decorator';
import { JwtUser } from 'src/constants/interfaces/req-user/jwt.user';

import {
  UpdateProjectWalletBodyDto,
  updateProjectWalletBodySchema,
  UpdateProjectWalletParamDto,
  updateProjectWalletParamSchema,
} from './dto/update.project.wallet';

@Controller('manager/project-wallet')
export class ProjectWalletController {
  constructor(private readonly projectWalletService: ProjectWalletService) {}

  @Post()
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async createWallet(
    @Body(ZodValidation(createProjectWalletSchema))
    body: CreateProjectWalletDto,
    @User() user: JwtUser,
  ) {
    const result = await this.projectWalletService.createWallet(
      user.userId,
      body,
    );

    return result;
  }

  @Patch('/:walletId')
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async updateWallet(
    @Body(ZodValidation(updateProjectWalletBodySchema))
    payload: UpdateProjectWalletBodyDto,
    @Param(ZodValidation(updateProjectWalletParamSchema))
    params: UpdateProjectWalletParamDto,
    @User() user: JwtUser,
  ) {
    const result = await this.projectWalletService.updateWalletStatus(
      user.userId,
      params.walletId,
      payload,
    );
  }
}
