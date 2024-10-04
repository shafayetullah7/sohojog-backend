import { Controller } from '@nestjs/common';
import { TeamWalletService } from './team-wallet.service';

@Controller('team-wallet')
export class TeamWalletController {
  constructor(private readonly teamWalletService: TeamWalletService) {}
}
