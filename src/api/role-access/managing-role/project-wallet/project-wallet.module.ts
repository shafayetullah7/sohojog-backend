import { Module } from '@nestjs/common';
import { ProjectWalletService } from './project-wallet.service';
import { ProjectWalletController } from './project-wallet.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ResponseBuilderModule } from 'src/shared/shared-modules/response-builder/response.builder.module';
import { UserModule } from 'src/api/user-module/user/user.module';

@Module({
  imports: [PrismaModule, ResponseBuilderModule,UserModule],
  controllers: [ProjectWalletController],
  providers: [ProjectWalletService],
})
export class ProjectWalletModule {}
