import { Module } from '@nestjs/common';
import { ProjectWalletService } from './project-wallet.service';
import { ProjectWalletController } from './project-wallet.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ResponseBuilderModule } from 'src/shared/modules/response-builder/response.builder.module';

@Module({
  imports: [PrismaModule, ResponseBuilderModule],
  controllers: [ProjectWalletController],
  providers: [ProjectWalletService],
})
export class ProjectWalletModule {}
