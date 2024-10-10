import {
  Controller,
} from '@nestjs/common';
import { TeamWalletTransactionService } from './team-wallet-transaction.service';


@Controller('team-wallet-transaction')
export class TeamWalletTransactionController {
  constructor(
    private readonly teamWalletTransactionService: TeamWalletTransactionService,
  ) {}
}
