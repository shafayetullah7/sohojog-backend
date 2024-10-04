import { Module } from '@nestjs/common';
import { TeamWalletService } from './team-wallet.service';
import { TeamWalletController } from './team-wallet.controller';

@Module({
  controllers: [TeamWalletController],
  providers: [TeamWalletService],
})
export class TeamWalletModule {}
