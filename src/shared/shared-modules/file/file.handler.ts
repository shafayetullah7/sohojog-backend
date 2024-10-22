import { BadRequestException } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import * as sharp from 'sharp';
import { AllowedFileType } from 'src/constants/enums/file.type.e';

export class FileHandler {
  // Extension to MIME type mapping
  private static extensionMimeMap: { [key: string]: string } = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  };


  static generateFileInterceptor(fileFieldName: string, allowedExtensions: AllowedFileType[], maxFileSize: number = 5000000) {
    return FileInterceptor(fileFieldName, {
      storage: memoryStorage(), // Store in memory
      limits: {
        fileSize: maxFileSize,
      },
      fileFilter: (req, file, callback) => {
        const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
        if (!fileExtension || !FileHandler.extensionMimeMap[fileExtension]) {
          return callback(
            new BadRequestException(`Unsupported file type: ${fileExtension}`),
            false,
          );
        }

        // Check if the file extension is in the allowed list
        if (!allowedExtensions.includes(fileExtension as AllowedFileType)) {
          return callback(
            new BadRequestException(
              `File extension not allowed: ${fileExtension}. Allowed: ${allowedExtensions.join(', ')}`,
            ),
            false,
          );
        }

        // Validate MIME type
        if (file.mimetype !== FileHandler.extensionMimeMap[fileExtension]) {
          return callback(
            new BadRequestException('Invalid MIME type for the file extension'),
            false,
          );
        }

        callback(null, true); // File is valid
      },
    });
  }

  // Multer configuration for multiple file uploads with fields
  static generateFileFieldsInterceptor(fieldNames: { name: string; maxCount?: number }[], allowedExtensions: AllowedFileType[], maxFileSize: number = 5000000) {
    return FileFieldsInterceptor(fieldNames, {
      storage: memoryStorage(), // Store in memory
      limits: {
        fileSize: maxFileSize,
      },
      fileFilter: (req, file, callback) => {
        const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
        if (!fileExtension || !FileHandler.extensionMimeMap[fileExtension]) {
          return callback(
            new BadRequestException(`Unsupported file type: ${fileExtension}`),
            false,
          );
        }

        // Check if the file extension is in the allowed list
        if (!allowedExtensions.includes(fileExtension as AllowedFileType)) {
          return callback(
            new BadRequestException(
              `File extension not allowed: ${fileExtension}. Allowed: ${allowedExtensions.join(', ')}`,
            ),
            false,
          );
        }

        // Validate MIME type
        if (file.mimetype !== FileHandler.extensionMimeMap[fileExtension]) {
          return callback(
            new BadRequestException('Invalid MIME type for the file extension'),
            false,
          );
        }

        callback(null, true); // File is valid
      },
    });
  }

  // Function to compress and convert an image to WebP format without losing much quality
  static async compressAndConvertToWebP(fileBuffer: Buffer, quality: number = 90): Promise<Buffer> {
    return await sharp(fileBuffer)
      .webp({ quality }) // Convert to WebP with high quality
      .toBuffer();
  }

  // Function to create three versions (min, mid, full), compress and convert to WebP
  static async compressAndCreateMultipleWebP(
    fileBuffer: Buffer,
    minSize = 200, // Width for the min version
    midSize = 500, // Width for the mid version
    fullSize = 1000, // Width for the full version
    quality: number = 90, // Default quality
  ): Promise<{ min: Buffer; mid: Buffer; full: Buffer }> {
    // Min version
    const min = await sharp(fileBuffer)
      .resize({ width: minSize })
      .webp({ quality })
      .toBuffer();

    // Mid version
    const mid = await sharp(fileBuffer)
      .resize({ width: midSize })
      .webp({ quality })
      .toBuffer();

    // Full version
    const full = await sharp(fileBuffer)
      .resize({ width: fullSize })
      .webp({ quality })
      .toBuffer();

    return { min, mid, full };
  }
}
