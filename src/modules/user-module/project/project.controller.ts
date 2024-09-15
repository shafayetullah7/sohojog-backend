import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ZodValidation } from 'src/shared/custom-decorator/zod.validation.decorator';
import {
  CreateProjectBodyDto,
  createProjectBodySchema,
} from './dto/create.project.dto';
import { User } from 'src/shared/custom-decorator/user.decorator';
import { JwtUser } from 'src/constants/interfaces/req-user/jwt.user';
import { JwtAuthGaurd } from 'src/shared/guards/jwt.auth.gaurd';
import { TokenValidationGuard } from 'src/shared/guards/token.validation.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/custom-decorator/roles.decorator';
import { Role } from 'src/constants/enums/user.roles';
import { ProjectService } from './project.service';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}
  @Post()
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async createProject(
    @Body(ZodValidation(createProjectBodySchema)) body: CreateProjectBodyDto,
    @User() user: JwtUser,
  ) {
    const result = await this.projectService.createProject(user.userId, body);
    return result;
  }
}
