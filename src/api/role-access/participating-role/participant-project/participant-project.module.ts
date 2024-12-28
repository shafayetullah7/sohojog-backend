import { Module } from '@nestjs/common';
import { ParticipantProjectService } from './participant-project.service';
import { ParticipantProjectController } from './participant-project.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ResponseBuilderModule } from 'src/shared/shared-modules/response-builder/response.builder.module';
import { UserModule } from 'src/api/user-module/user/user.module';

@Module({
  controllers: [ParticipantProjectController],
  providers: [ParticipantProjectService],
  imports: [PrismaModule, ResponseBuilderModule, UserModule],
})
export class ParticipantProjectModule {}
