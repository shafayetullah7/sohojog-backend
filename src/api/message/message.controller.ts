import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { SendMessageDto, sendMessageSchema } from './dto/send.message.dto';
import { ZodValidation } from 'src/shared/custom-decorator/zod.validation.decorator';
import { User } from 'src/shared/custom-decorator/user.decorator';
import { JwtUser } from 'src/constants/interfaces/req-user/jwt.user';
import { UploadApiResponse } from 'cloudinary';
import { CloudinaryService } from 'src/shared/shared-modules/file/cloudinary.service';
import { FileService } from 'src/shared/shared-modules/file/file.service';
import {
  GetGroupMessageParamsDto,
  getGroupMessageParamsSchema,
  GetGroupMessageQueryDto,
  getGroupMessageQuerySchema,
} from './dto/get.group.messages.dto';
import { Roles } from 'src/shared/custom-decorator/roles.decorator';
import { JwtAuthGaurd } from 'src/shared/guards/jwt.auth.gaurd';
import { Role } from 'src/constants/enums/user.roles';
import { TokenValidationGuard } from 'src/shared/guards/token.validation.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import {
  ProjectGroupQueryDto,
  projectGroupQuerySchema,
} from './dto/project.group.query.dto';

@Controller('messages')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly fileService: FileService,
  ) {}

  @Get('group-chats')
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async getProjectChatGroups(
    @Query(ZodValidation(projectGroupQuerySchema)) query: ProjectGroupQueryDto,
    @User() user: JwtUser,
  ) {
    const result = await this.messageService.getProjectChats(
      user.userId,
      query,
    );

    return result;
  }

  @Post()
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async sendMessageToGroup(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body(ZodValidation(sendMessageSchema)) body: SendMessageDto,
    @User() user: JwtUser,
  ) {
    let uploadedFiles: UploadApiResponse[] = [];
    console.log({ files });

    try {
      // console.log('***********', files);
      uploadedFiles = await this.cloudinaryService.uploadMultipleFiles(
        files || [],
      );
      const result = await this.messageService.sendMessageToRoom(
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

      // console.error('Error creating task: ', error);
      // if (
      //   error instanceof NotFoundException ||
      //   error instanceof BadRequestException ||
      //   error instanceof ConflictException
      // ) {
      //   throw error;
      // } else {
      //   throw error;
      // }
      throw error;
      // throw new InternalServerErrorException(
      //   'Failed to create task. Files have been deleted.',
      // );
    }
  }

  @Get(':roomId')
  @Roles(Role.User)
  @UseGuards(JwtAuthGaurd, TokenValidationGuard, RolesGuard)
  async getGroupMessages(
    @Param(ZodValidation(getGroupMessageParamsSchema))
    param: GetGroupMessageParamsDto,
    @Query(ZodValidation(getGroupMessageQuerySchema))
    query: GetGroupMessageQueryDto,
    @User() user: JwtUser,
  ) {
    const { userId } = user;

    const messages = await this.messageService.getMessages(
      userId,
      param.roomId,
      query,
    );

    return messages;
  }
}
