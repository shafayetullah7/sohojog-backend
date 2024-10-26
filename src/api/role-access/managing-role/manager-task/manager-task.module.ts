import { Module } from '@nestjs/common';
import { ManagerTaskService } from './manager-task.service';
import { ManagerTaskController } from './manager-task.controller';
import { FileModule } from 'src/shared/shared-modules/file/file.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [FileModule, PrismaModule],
  controllers: [ManagerTaskController],
  providers: [ManagerTaskService],
})
export class ManagerTaskModule {}
