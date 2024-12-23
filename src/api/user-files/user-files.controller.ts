import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserFilesService } from './user-files.service';
import { Roles } from 'src/shared/custom-decorator/roles.decorator';
import { Role } from 'src/constants/enums/user.roles';
import { JwtAuthGaurd } from 'src/shared/guards/jwt.auth.gaurd';
import { TokenValidationGuard } from 'src/shared/guards/token.validation.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { FileHandler } from 'src/shared/shared-modules/file/file.handler';
import { User } from 'src/shared/custom-decorator/user.decorator';
import { JwtUser } from 'src/constants/interfaces/req-user/jwt.user';
import { UploadApiResponse } from 'cloudinary';
import { ZodValidation } from 'src/shared/custom-decorator/zod.validation.decorator';
import { DeleteFilesDto, deleteFilesSchema } from './dto/delete.files.dto';
import { CloudinaryService } from 'src/shared/shared-modules/file/cloudinary.service';

@Controller('user-files')
export class UserFilesController {
  constructor(
    private readonly userFilesService: UserFilesService,
    private readonly cloudinaryService: CloudinaryService,
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
      'docx',
      'pptx',
      'csv',
    ]),
  )
  async uploadUserFiles(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @User() user: JwtUser,
  ) {
    let uploadedFiles = await this.cloudinaryService.uploadMultipleFiles(files);

    try {
      if (!files?.length) {
        throw new BadRequestException('No data provided');
      }

      const result = await this.userFilesService.uploadUserFiles(
        uploadedFiles,
        user.userId,
      );

      return result;
    } catch (error) {
      console.log('Failed to upload file', error);
      await this.cloudinaryService.deleteMultipleFiles(
        uploadedFiles.map((file) => file.public_id),
      );
      throw error;
    }
  }

  @Delete()
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async deleteFiles(
    @Body(ZodValidation(deleteFilesSchema)) body: DeleteFilesDto,
    @User() user: JwtUser,
  ) {
    const result = await this.userFilesService.deleteUserMultipleFiles(
      user.userId,
      body.fileIds,
    );

    return result;
  }
}
