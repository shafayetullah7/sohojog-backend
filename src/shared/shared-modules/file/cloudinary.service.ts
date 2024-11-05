import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EnvConfigService } from 'src/env-config/env.config.service';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as sharp from 'sharp'; // Import sharp for image compression

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: EnvConfigService) {
    cloudinary.config({
      cloud_name: configService.cloudinaryCloudName,
      api_key: this.configService.cloudinaryApiKey,
      api_secret: this.configService.cloudinaryApiSecret,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    toWebp: boolean = false,
    compress: boolean = false,
  ): Promise<UploadApiResponse> {
    try {
      // Check if the file is an image type (jpeg, png, webp)
      const isImage = ['image/jpeg', 'image/png', 'image/webp'].includes(
        file.mimetype,
      );

      let fileBuffer = file.buffer;

      if (compress) {
        if (isImage) {
          const sharpInstance = sharp(fileBuffer);

          if (toWebp) {
            fileBuffer = await sharpInstance.webp({ quality: 80 }).toBuffer();
          } else {
            const originalFormat = this.getSharpFormat(file.mimetype);

            if (originalFormat) {
              fileBuffer = await sharpInstance
                .toFormat(originalFormat, { quality: 80 })
                .toBuffer();
            } else {
              throw new InternalServerErrorException(
                'Unsupported image format',
              );
            }
          }
        }
      }

      return new Promise((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          { resource_type: 'auto' },
          (error, result) => {
            if (error) return reject(error);
            if (!result) {
              throw new InternalServerErrorException('Failed to upload file.');
            }
            resolve(result);
          },
        );

        // Send the processed file buffer to Cloudinary
        upload.end(fileBuffer);
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to process file.',
        error.message,
      );
    }
  }

  private getSharpFormat(mimetype: string): keyof sharp.FormatEnum | undefined {
    const mimeFormatMap: { [key: string]: keyof sharp.FormatEnum } = {
      'image/jpeg': 'jpeg',
      'image/png': 'png',
      'image/webp': 'webp',
    };

    return mimeFormatMap[mimetype];
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
  ): Promise<UploadApiResponse[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file));
    try {
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to upload one or more files.',
      );
    }
  }

  async deleteMultipleFiles(publicIds: string[]): Promise<UploadApiResponse[]> {
    try {
      const deletePromises = publicIds.map((publicId) =>
        this.deleteFile(publicId),
      );

      const results = await Promise.all(deletePromises);
      return results;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to delete one or more files.',
      );
    }
  }

  deleteFile(publicId: string): Promise<UploadApiResponse> {
    return cloudinary.uploader.destroy(publicId);
  }

  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse[]> {
    // Validate if the file is an image
    const validImageTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/jpg',
    ];
    if (!validImageTypes.includes(file.mimetype)) {
      throw new InternalServerErrorException(
        'Invalid file type. Please upload a valid image.',
      );
    }

    // Create a transformation array for Cloudinary upload
    const transformations = [
      {
        width: 90,
        height: 90,
        crop: 'fit',
        format: 'webp',
        quality: 'auto:good',
      }, // Thumbnail
      {
        width: 450,
        height: 450,
        crop: 'fit',
        format: 'webp',
        quality: 'auto:good',
      }, // Medium
      {
        width: 900,
        height: 900,
        crop: 'fit',
        format: 'webp',
        quality: 'auto:good',
      }, // Full size
    ];

    try {
      const uploadResults: UploadApiResponse[] = await Promise.all(
        transformations.map(async (transformation) => {
          return new Promise<UploadApiResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { resource_type: 'image', ...transformation },
              (error, result) => {
                if (error) {
                  return reject(
                    new InternalServerErrorException(
                      'Error uploading file to Cloudinary',
                      error.message,
                    ),
                  );
                }
                if (result) {
                  resolve(result); // Ensure result is defined before resolving
                } else {
                  reject(
                    new InternalServerErrorException(
                      'Upload returned no result.',
                    ),
                  );
                }
              },
            );
            uploadStream.end(file.buffer); // Ensure we pass the file buffer to the upload stream
          });
        }),
      );

      return uploadResults; // Return all upload results
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to upload image to Cloudinary',
        error.message,
      );
    }
  }
}
