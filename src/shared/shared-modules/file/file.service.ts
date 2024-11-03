import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadApiResponse } from 'cloudinary';
import { Express } from 'express';
import { File, FileType, Prisma } from '@prisma/client';
import { CloudinaryService } from './cloudinary.service';
import { getFileType } from 'src/shared/utils/functions/getFileType';

@Injectable()
export class FileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async uploadSingleFileAndInsert(
    file: Express.Multer.File,
    uploadBy?: string,
    transaction?: Prisma.TransactionClient,
  ): Promise<File> {
    try {
      const uploadResult: UploadApiResponse =
        await this.cloudinaryService.uploadFile(file);
      const fileType = getFileType(uploadResult.format); // Get file type from Cloudinary response
      const fileRecord = await this.insertSingleFile(
        uploadResult,
        fileType,
        uploadBy,
        transaction,
      );
      return fileRecord;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to upload single file and insert record into the database',
        error.message,
      );
    }
  }

  async uploadMultipleFilesAndInsert(
    files: Express.Multer.File[],
    uploadBy?: string,
    transaction?: Prisma.TransactionClient,
  ): Promise<File[]> {
    try {
      if (!files.length) return [];
      const uploadResults: UploadApiResponse[] = await Promise.all(
        files.map((file) => this.cloudinaryService.uploadFile(file)),
      );

      const fileRecords = await this.insertMultipleFiles(
        uploadResults,
        uploadBy,
        transaction,
      );

      return fileRecords;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to upload multiple files and insert records into the database',
        error.message,
      );
    }
  }

  // Insert multiple files into the database
  async insertMultipleFiles(
    filesData: UploadApiResponse[],
    uploadBy?: string,
    transaction?: Prisma.TransactionClient,
  ): Promise<File[]> {
    try {
      const prismaClient = transaction || this.prisma;

      const fileRecords = await Promise.all(
        filesData.map((fileData) => {
          const fileType = getFileType(fileData.format); // Get file type from Cloudinary response
          return prismaClient.file.create({
            data: {
              file: fileData.secure_url,
              publicId: fileData.public_id,
              fileType,
              fileName: fileData.original_filename,
              extension: fileData.format,
              uploadBy,
            },
          });
        }),
      );

      return fileRecords;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to insert multiple file records into the database',
        error.message,
      );
    }
  }

  async insertSingleFile(
    fileData: UploadApiResponse,
    fileType: FileType,
    uploadBy?: string,
    transaction?: Prisma.TransactionClient,
  ): Promise<File> {
    try {
      const prismaClient = transaction || this.prisma;
      const fileRecord = await prismaClient.file.create({
        data: {
          file: fileData.secure_url,
          publicId: fileData.public_id,
          fileType,
          fileName: fileData.original_filename,
          extension: fileData.format,
          uploadBy,
        },
      });

      return fileRecord;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to insert single file record into the database',
        error.message,
      );
    }
  }

  async deleteSingleFile(
    fileId: string,
    transaction?: Prisma.TransactionClient,
  ): Promise<File> {
    try {
      const prismaClient = transaction || this.prisma;
      const fileRecord = await prismaClient.file.findUnique({
        where: { id: fileId },
      });

      if (!fileRecord) {
        throw new InternalServerErrorException('File not found');
      }

      const deletedFile = await prismaClient.file.delete({
        where: { id: fileId },
      });

      await this.cloudinaryService.deleteFile(fileRecord.publicId);
      return deletedFile;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to delete file',
        error.message,
      );
    }
  }

  async deleteMultipleFiles(
    fileIds: string[],
    transaction?: Prisma.TransactionClient,
  ): Promise<File[]> {
    try {
      const prismaClient = transaction || this.prisma;
      const fileRecords = await prismaClient.file.findMany({
        where: { id: { in: fileIds } },
      });

      if (!fileRecords || fileRecords.length === 0) {
        throw new InternalServerErrorException('Files not found');
      }

      await prismaClient.file.deleteMany({
        where: { id: { in: fileIds } },
      });

      await Promise.all(
        fileRecords.map((file) =>
          this.cloudinaryService.deleteFile(file.publicId),
        ),
      );

      return fileRecords;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to delete multiple files',
        error.message,
      );
    }
  }

  
}
