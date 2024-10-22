import { Module } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';
import { UserModule } from 'src/api/user-module/user/user.module';
import { EmailModule } from 'src/shared/shared-modules/email/email.module';
import { ResponseBuilderModule } from 'src/shared/shared-modules/response-builder/response.builder.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule, ResponseBuilderModule, EmailModule, UserModule],
  controllers: [InvitationController],
  providers: [InvitationService],
})
export class InvitationModule {}
