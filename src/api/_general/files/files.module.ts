import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { EnvConfigModule } from 'src/env-config/env.config.module';

@Module({
  imports: [EnvConfigModule],
  providers: [FilesService, CloudinaryService],
  exports: [CloudinaryService],
})
export class FilesModule {}
