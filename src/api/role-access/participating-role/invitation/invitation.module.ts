import { Module } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ResponseBuilderModule } from 'src/shared/shared-modules/response-builder/response.builder.module';
import { UserModule } from 'src/api/user-module/user/user.module';

@Module({
  imports: [PrismaModule, ResponseBuilderModule, UserModule],
  controllers: [InvitationController],
  providers: [InvitationService],
})
export class InvitationModule {}
