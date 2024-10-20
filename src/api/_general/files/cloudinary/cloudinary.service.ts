import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EnvConfigService } from 'src/env-config/env.config.service';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: EnvConfigService) {
    cloudinary.config({
      cloud_name: configService.cloudinaryCloudName,
      api_key: this.configService.cloudinaryApiKey,
      api_secret: this.configService.cloudinaryApiSecret,
    });
  }

  uploadFile(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => {
          if (error) return reject(error);
          if (!result) {
            throw new InternalServerErrorException('Failed to upload image.');
          }
          resolve(result);
        },
      );

      upload.end(file.buffer);
    });
  }

  deleteFile(publicId: string): Promise<UploadApiResponse> {
    return cloudinary.uploader.destroy(publicId);
  }
}
