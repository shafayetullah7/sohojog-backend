import { Module } from '@nestjs/common';
import { UserFilesService } from './user-files.service';
import { UserFilesController } from './user-files.controller';
import { UserModule } from '../user-module/user/user.module';
import { FileModule } from 'src/shared/shared-modules/file/file.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ResponseBuilderModule } from 'src/shared/shared-modules/response-builder/response.builder.module';

@Module({
  imports: [UserModule, FileModule, PrismaModule, ResponseBuilderModule],
  controllers: [UserFilesController],
  providers: [UserFilesService],
})
export class UserFilesModule {}
