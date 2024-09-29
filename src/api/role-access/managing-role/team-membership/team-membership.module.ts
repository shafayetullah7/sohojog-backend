import { Module } from '@nestjs/common';
import { TeamMembershipService } from './team-membership.service';
import { TeamMembershipController } from './team-membership.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TeamMembershipController],
  providers: [TeamMembershipService],
})
export class TeamMembershipModule {}
