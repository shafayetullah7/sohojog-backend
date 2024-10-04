import { Module } from '@nestjs/common';
import { ProjectWalletTransactionService } from './project-wallet-transaction.service';
import { ProjectWalletTransactionController } from './project-wallet-transaction.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ResponseBuilderModule } from 'src/shared/modules/response-builder/response.builder.module';

@Module({
  imports: [PrismaModule,ResponseBuilderModule],
  controllers: [ProjectWalletTransactionController],
  providers: [ProjectWalletTransactionService],
})
export class ProjectWalletTransactionModule {}
