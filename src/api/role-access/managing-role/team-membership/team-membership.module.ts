import { Module } from '@nestjs/common';
import { TeamMembershipService } from './team-membership.service';
import { TeamMembershipController } from './team-membership.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ResponseBuilderModule } from 'src/shared/shared-modules/response-builder/response.builder.module';
import { UserModule } from 'src/api/user-module/user/user.module';

@Module({
  imports: [PrismaModule,ResponseBuilderModule,UserModule],
  controllers: [TeamMembershipController],
  providers: [TeamMembershipService],
})
export class TeamMembershipModule {}
