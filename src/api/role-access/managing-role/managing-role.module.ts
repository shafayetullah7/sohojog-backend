import { Module } from '@nestjs/common';
import { ProjectModule } from './project/project.module';
import { InvitationModule } from './invitation/invitation.module';
import { TeamModule } from './team/team.module';
import { TeamMembershipModule } from './team-membership/team-membership.module';
import { ProjectWalletModule } from './project-wallet/project-wallet.module';
import { ProjectWalletTransactionModule } from './project-wallet-transaction/project-wallet-transaction.module';
import { TeamWalletModule } from './team-wallet/team-wallet.module';
import { TeamWalletTransactionModule } from './team-wallet-transaction/team-wallet-transaction.module';
import { ProjectParticipationModule } from './project-participation/project-participation.module';
import { ManagerTaskModule } from './manager-task/manager-task.module';
import { ProjectPropertiesModule } from './project-properties/project-properties.module';

@Module({
  imports: [
    ProjectModule,
    InvitationModule,
    TeamModule,
    TeamMembershipModule,
    ProjectWalletModule,
    ProjectWalletTransactionModule,
    TeamWalletModule,
    TeamWalletTransactionModule,
    ProjectParticipationModule,
    ManagerTaskModule,
    ProjectPropertiesModule,
  ],
})
export class ManagingRoleModule {}
