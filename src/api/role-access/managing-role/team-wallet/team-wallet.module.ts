import { Module } from '@nestjs/common';
import { TeamWalletService } from './team-wallet.service';
import { TeamWalletController } from './team-wallet.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports:[PrismaModule],
  controllers: [TeamWalletController],
  providers: [TeamWalletService],
})
export class TeamWalletModule {}
