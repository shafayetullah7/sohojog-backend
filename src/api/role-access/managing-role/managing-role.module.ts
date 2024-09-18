import { Module } from '@nestjs/common';
import { ProjectModule } from './project/project.module';
import { InvitationModule } from './invitation/invitation.module';

@Module({
  imports: [ProjectModule, InvitationModule]
})
export class ManagingRoleModule {}
