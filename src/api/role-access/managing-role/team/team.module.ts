import { Module } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ResponseBuilderModule } from 'src/shared/shared-modules/response-builder/response.builder.module';
import { UserModule } from 'src/api/user-module/user/user.module';

@Module({
  imports: [PrismaModule, ResponseBuilderModule, UserModule],
  controllers: [TeamController],
  providers: [TeamService],
})
export class TeamModule {}
