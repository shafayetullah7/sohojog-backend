import { Module } from '@nestjs/common';
import { InvitationModule } from './invitation/invitation.module';

@Module({
  imports: [InvitationModule]
})
export class ParticipatingRoleModule {}
