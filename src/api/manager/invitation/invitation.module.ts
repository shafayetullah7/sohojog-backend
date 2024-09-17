import { Module } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ResponseBuilderModule } from 'src/shared/modules/response-builder/response.builder.module';
import { EmailModule } from 'src/shared/modules/email/email.module';
import { UserModule } from 'src/api/user-module/user/user.module';

@Module({
  imports: [PrismaModule, ResponseBuilderModule, EmailModule, UserModule],
  controllers: [InvitationController],
  providers: [InvitationService],
})
export class InvitationModule {}
