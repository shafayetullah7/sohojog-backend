import { Controller } from '@nestjs/common';
import { ProjectWalletTransactionService } from './project-wallet-transaction.service';

@Controller('project-wallet-transaction')
export class ProjectWalletTransactionController {
  constructor(private readonly projectWalletTransactionService: ProjectWalletTransactionService) {}
}
