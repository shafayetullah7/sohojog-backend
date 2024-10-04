import { Controller } from '@nestjs/common';
import { ProjectWalletService } from './project-wallet.service';

@Controller('project-wallet')
export class ProjectWalletController {
  constructor(private readonly projectWalletService: ProjectWalletService) {}
}
