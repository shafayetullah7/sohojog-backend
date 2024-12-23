import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadApiResponse } from 'cloudinary';
import { Express } from 'express';
import { File, FileType, Image, Prisma } from '@prisma/client';
import { CloudinaryService } from './cloudinary.service';
import { getFileType } from 'src/shared/utils/functions/getFileType';
import { ResponseBuilder } from '../response-builder/response.builder';

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
      console.log('file upload error', error);
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

  async uploadSingleImageAndInsert(
    file: Express.Multer.File,
    uploadBy: string,
    transaction?: Prisma.TransactionClient,
  ): Promise<Image> {
    try {
      // Validate that the file is an image
      if (!file || !file.mimetype.startsWith('image/')) {
        throw new BadRequestException('The uploaded file must be an image.');
      }

      // Upload file to Cloudinary with transformations for different sizes and formats, including quality optimization
      const uploadResults = await this.cloudinaryService.uploadImage(file);

      // Insert image record into the database
      const prismaClient = transaction || this.prisma;
      const imageRecord = await prismaClient.image.create({
        data: {
          minUrl: uploadResults[0].secure_url, // Thumbnail URL
          midUrl: uploadResults[1].secure_url, // Medium URL
          fullUrl: uploadResults[2].secure_url, // Full size URL
          minPublicId: uploadResults[0].public_id, // Thumbnail public ID
          midPublicId: uploadResults[1].public_id, // Medium public ID
          maxPublicId: uploadResults[2].public_id, // Full public ID
          uploadBy,
        },
      });

      return imageRecord;
    } catch (error) {
      // console.log()
      // throw new InternalServerErrorException(
      //   'Failed to upload image and insert record into the database',
      //   error.message,
      // );
      throw error;
    }
  }

  async uploadMultipleImagesAndInsert(
    files: Express.Multer.File[],
    uploadBy?: string,
    transaction?: Prisma.TransactionClient,
  ): Promise<Image[]> {
    const prismaClient = transaction || this.prisma;

    try {
      // Validate that all files are images
      for (const file of files) {
        if (!file || !file.mimetype.startsWith('image/')) {
          throw new BadRequestException('All uploaded files must be images.');
        }
      }

      // Create an array of promises for uploading and inserting each image
      const imageInsertPromises = files.map(async (file) => {
        const uploadResults = await this.cloudinaryService.uploadImage(file);

        // Insert image record into the database
        return prismaClient.image.create({
          data: {
            minUrl: uploadResults[0].secure_url, // Thumbnail URL
            midUrl: uploadResults[1].secure_url, // Medium URL
            fullUrl: uploadResults[2].secure_url, // Full size URL
            minPublicId: uploadResults[0].public_id, // Thumbnail public ID
            midPublicId: uploadResults[1].public_id, // Medium public ID
            maxPublicId: uploadResults[2].public_id, // Full public ID
            uploadBy,
          },
        });
      });

      // Wait for all promises to resolve
      const imageRecords = await Promise.all(imageInsertPromises);

      return imageRecords; // Return all inserted image records
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to upload images and insert records into the database',
        error.message,
      );
    }
  }

  async deleteImagesAndRecord(
    imageId: string,
    transaction?: Prisma.TransactionClient,
  ): Promise<void> {
    const prismaClient = transaction || this.prisma;

    try {
      // Step 1: Retrieve the image record from the database
      const imageRecord = await prismaClient.image.findUnique({
        where: { id: imageId },
      });

      if (!imageRecord) {
        console.log('Image record not found. to delete');
        return;
        // throw new InternalServerErrorException('Image record not found.');
      }

      await prismaClient.image.delete({
        where: { id: imageId },
      });

      const publicIds = [
        imageRecord.minPublicId,
        imageRecord.midPublicId,
        imageRecord.maxPublicId,
      ].filter((data) => !!data);

      try {
        if (publicIds?.length) {
          await this.cloudinaryService.deleteMultipleFiles(
            publicIds as string[],
          );
          console.log('Image deleted', publicIds);
          // await this.deleteMultipleFiles(publicIds as string[]);
        }
      } catch (error) {
        console.log('Failed to delete image', publicIds, error);
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Failed to delete images and record.',
        error.message,
      );
    }
  }
}
