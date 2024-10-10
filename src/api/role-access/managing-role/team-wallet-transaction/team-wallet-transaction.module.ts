import { Module } from '@nestjs/common';
import { TeamWalletTransactionService } from './team-wallet-transaction.service';
import { TeamWalletTransactionController } from './team-wallet-transaction.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TeamWalletTransactionController],
  providers: [TeamWalletTransactionService],
})
export class TeamWalletTransactionModule {}
