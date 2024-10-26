import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ManagerTaskService } from './manager-task.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileHandler } from 'src/shared/shared-modules/file/file.handler';
import { CloudinaryService } from 'src/shared/shared-modules/file/cloudinary.service';
import { NotFoundError } from 'rxjs';
import { ZodValidation } from 'src/shared/custom-decorator/zod.validation.decorator';
import { CreateTaskDto, createTaskSchema } from './dto/create.task.dto';
import { FileService } from 'src/shared/shared-modules/file/file.service';
import { UploadApiResponse } from 'cloudinary';
import { Roles } from 'src/shared/custom-decorator/roles.decorator';
import { Role } from 'src/constants/enums/user.roles';
import { JwtAuthGaurd } from 'src/shared/guards/jwt.auth.gaurd';
import { TokenValidationGuard } from 'src/shared/guards/token.validation.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { User } from 'src/shared/custom-decorator/user.decorator';
import { JwtUser } from 'src/constants/interfaces/req-user/jwt.user';

@Controller('manager/tasks')
export class ManagerTaskController {
  constructor(
    private readonly managerTaskService: ManagerTaskService,
    // private readonly fileHandler: FileHandler,
    private readonly cloudinaryService: CloudinaryService,
    private readonly fileService: FileService,
  ) {}

  @Post()
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
  async createTask(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body(ZodValidation(createTaskSchema)) body: CreateTaskDto,
    @User() user: JwtUser,
  ) {
    let uploadedFiles: UploadApiResponse[] = [];

    try {
      uploadedFiles = await this.cloudinaryService.uploadMultipleFiles(files);

      const result = await this.managerTaskService.createTask(
        user.userId,
        body,
        uploadedFiles,
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
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      } else {
        throw error;
      }
      // throw new InternalServerErrorException(
      //   'Failed to create task. Files have been deleted.',
      // );
    }
  }
}
