import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ParticipantTasksService } from './participant-tasks.service';
import { Roles } from 'src/shared/custom-decorator/roles.decorator';
import { Role } from 'src/constants/enums/user.roles';
import { JwtAuthGaurd } from 'src/shared/guards/jwt.auth.gaurd';
import { TokenValidationGuard } from 'src/shared/guards/token.validation.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { User } from 'src/shared/custom-decorator/user.decorator';
import { JwtUser } from 'src/constants/interfaces/req-user/jwt.user';
import { ZodValidation } from 'src/shared/custom-decorator/zod.validation.decorator';
import { QueryTaskDto, queryTaskSchema } from './dto/get.participant.tasks.dto';
import {
  GetSingleTaskParamsDto,
  getSingleTaskParamsSchema,
} from './dto/get.single.task.dto';
import { FileHandler } from 'src/shared/shared-modules/file/file.handler';
import { UploadApiResponse } from 'cloudinary';
import { CloudinaryService } from 'src/shared/shared-modules/file/cloudinary.service';
import {
  AssignmentSubmissionDto,
  assignmentSubmissionSchema,
} from './dto/submit.task.dto';

@Controller('participant/tasks')
export class ParticipantTasksController {
  constructor(
    private readonly participantTasksService: ParticipantTasksService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async getMyProjects(
    @Query(ZodValidation(queryTaskSchema))
    query: QueryTaskDto,
    @User() user: JwtUser,
  ) {
    const result = await this.participantTasksService.getParticipantTasks(
      user.userId,
      query,
    );
    return result;
  }

  @Get('/:id')
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async getSingleProject(
    @Param(ZodValidation(getSingleTaskParamsSchema))
    param: GetSingleTaskParamsDto,
    @User() user: JwtUser,
  ) {
    const result = await this.participantTasksService.getSingleTask(
      user.userId,
      param.id,
    );
    return result;
  }

  @Post('submit')
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  @UseInterceptors(
    FileHandler.generateMultipleFilesInterceptor('files', [
      'jpg',
      'jpeg',
      'png',
      'pdf',
    ]),
  )
  async submitTask(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body(ZodValidation(assignmentSubmissionSchema))
    body: AssignmentSubmissionDto,
    @User() user: JwtUser,
  ) {
    let uploadedFiles: UploadApiResponse[] = [];
    console.log({ files });

    try {
      uploadedFiles = await this.cloudinaryService.uploadMultipleFiles(
        files || [],
      );

      const result = await this.participantTasksService.submitTask(
        user.userId,
        body,
        uploadedFiles || [],
      );

      return result;
    } catch (error) {
      // If an error occurs, delete uploaded files
      if (uploadedFiles.length) {
        await this.cloudinaryService.deleteMultipleFiles(
          uploadedFiles.map((file) => file.public_id),
        );
      }

      console.error('Error creating task: ', error);
      throw error;
      // throw new InternalServerErrorException(
      //   'Failed to create task. Files have been deleted.',
      // );
    }
  }
}
