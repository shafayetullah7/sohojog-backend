import { Module } from '@nestjs/common';
import { TeamWalletTransactionService } from './team-wallet-transaction.service';
import { TeamWalletTransactionController } from './team-wallet-transaction.controller';

@Module({
  controllers: [TeamWalletTransactionController],
  providers: [TeamWalletTransactionService],
})
export class TeamWalletTransactionModule {}
