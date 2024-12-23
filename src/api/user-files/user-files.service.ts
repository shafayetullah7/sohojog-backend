import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { File } from '@prisma/client';
import { UploadApiResponse } from 'cloudinary';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileService } from 'src/shared/shared-modules/file/file.service';
import { ResponseBuilder } from 'src/shared/shared-modules/response-builder/response.builder';

@Injectable()
export class UserFilesService {
  constructor(
    private readonly response: ResponseBuilder<any>,
    private readonly prismaService: PrismaService,
    private readonly fileService: FileService,
  ) {}

  async uploadUserFiles(
    files: UploadApiResponse[],
    uploadBy: string,
  ): Promise<ResponseBuilder<File[]>> {
    const result = await this.prismaService.$transaction(async (tx) => {
      const filesData = await this.fileService.insertMultipleFiles(
        files,
        uploadBy,
        tx,
      );

      return filesData;
    });

    return this.response
      .setSuccess(true)
      .setMessage('Files uploaded')
      .setData({ files: result });
  }

  async deleteUserMultipleFiles(userId: string, fileIds: string[]) {
    const files = await this.prismaService.file.findMany({
      where: {
        uploadBy: userId,
        id: {
          in: [...fileIds],
        },
      },
    });

    if (!files.length) {
      throw new BadRequestException('Files not found');
    }

    fileIds.forEach((id) => {
      if (!files.find((file) => file.id === id)) {
        throw new NotFoundException('Files not found');
      }
    });

    await this.fileService.deleteMultipleFiles(fileIds);
    return this.response
      .setSuccess(true)
      .setMessage('Files deleted')
      .setData({ data: null });
  }
}
