import { forwardRef, Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileHandler } from './file.handler';
import { CloudinaryService } from './cloudinary.service';
import { EnvConfigModule } from 'src/env-config/env.config.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ResponseBuilderModule } from '../response-builder/response.builder.module';
import { UserModule } from 'src/api/user-module/user/user.module';

@Module({
  imports: [EnvConfigModule, PrismaModule],
  exports: [FileHandler, CloudinaryService, FileService],
  providers: [FileService, FileHandler, CloudinaryService],
  controllers: [],
})
export class FileModule {}
