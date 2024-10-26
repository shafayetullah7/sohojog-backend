import { Module } from '@nestjs/common';
import { ManagerTaskService } from './manager-task.service';
import { ManagerTaskController } from './manager-task.controller';
import { FileModule } from 'src/shared/shared-modules/file/file.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ResponseBuilderModule } from 'src/shared/shared-modules/response-builder/response.builder.module';
import { UserModule } from 'src/api/user-module/user/user.module';

@Module({
  imports: [FileModule, PrismaModule, ResponseBuilderModule, UserModule],
  controllers: [ManagerTaskController],
  providers: [ManagerTaskService],
})
export class ManagerTaskModule {}
