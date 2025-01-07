import { Module } from '@nestjs/common';
import { ParticipantTasksService } from './participant-tasks.service';
import { ParticipantTasksController } from './participant-tasks.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ResponseBuilderModule } from 'src/shared/shared-modules/response-builder/response.builder.module';
import { UserModule } from 'src/api/user-module/user/user.module';
import { FileModule } from 'src/shared/shared-modules/file/file.module';

@Module({
  controllers: [ParticipantTasksController],
  providers: [ParticipantTasksService],
  imports: [PrismaModule, ResponseBuilderModule, UserModule, FileModule],
})
export class ParticipantTasksModule {}
