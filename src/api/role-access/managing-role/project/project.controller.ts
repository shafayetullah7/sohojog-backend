import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/shared/custom-decorator/roles.decorator';
import { Role } from 'src/constants/enums/user.roles';
import { JwtAuthGaurd } from 'src/shared/guards/jwt.auth.gaurd';
import { TokenValidationGuard } from 'src/shared/guards/token.validation.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { ZodValidation } from 'src/shared/custom-decorator/zod.validation.decorator';
import {
  CreateProjectBodyDto,
  createProjectBodySchema,
} from './dto/create.project.dto';
import { User } from 'src/shared/custom-decorator/user.decorator';
import { JwtUser } from 'src/constants/interfaces/req-user/jwt.user';
import { ProjectService } from './project.service';
import {
  GetMyProjectsQueryDto,
  getMyProjectsQuerySchema,
} from './dto/get.my.projets.dto';
import {
  UpdateProjectBodyDto,
  updateProjectBodySchema,
  UpdateProjectParamDto,
  updateProjectParamSchema,
} from './dto/update.project.dto';
import {
  GetSingleProjectDto,
  getSingleProjectSchema,
} from './dto/get.single.project.dto';

@Controller('manager/projects')
export class ProjectController {
  constructor(private readonly projectsService: ProjectService) {}

  @Post()
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async createProject(
    @Body(ZodValidation(createProjectBodySchema)) body: CreateProjectBodyDto,
    @User() user: JwtUser,
  ) {
    const result = await this.projectsService.createProject(user.userId, body);
    return result;
  }

  @Get()
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async getMyProjects(
    @Query(ZodValidation(getMyProjectsQuerySchema))
    query: GetMyProjectsQueryDto,
    @User() user: JwtUser,
  ) {
    const result = await this.projectsService.getMyProjects(user.userId, query);
    return result;
  }

  @Get('/:id')
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async getSingleProject(
    @Param(ZodValidation(getSingleProjectSchema)) param: GetSingleProjectDto,
    @User() user: JwtUser,
  ) {
    const { id } = param;

    const result = await this.projectsService.getSingleProject(user.userId, id);

    return result;
  }

  @Get('/:id/summary')
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async getProjectSummary(
    @Param(ZodValidation(getSingleProjectSchema)) param: GetSingleProjectDto,
    @User() user: JwtUser,
  ) {
    const { id } = param;

    const result = await this.projectsService.getProjectSummary(id);

    return result;
  }

  @Patch('/:id')
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async updateMyProject(
    @Param(ZodValidation(updateProjectParamSchema))
    param: UpdateProjectParamDto,

    @Body(ZodValidation(updateProjectBodySchema))
    body: UpdateProjectBodyDto,

    @User()
    user: JwtUser,
  ) {
    const result = await this.projectsService.updateProject(
      user.userId,
      param.id,
      body,
    );
    return result;
  }
}
