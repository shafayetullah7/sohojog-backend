import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailModule } from 'src/shared/shared-modules/email/email.module';
import { EmailService } from 'src/shared/shared-modules/email/email.service';
import { PasswordManagerModule } from 'src/shared/shared-modules/password-manager/password-manager.module';
import { EnvConfigModule } from 'src/env-config/env.config.module';

@Module({
  imports: [PrismaModule, EmailModule,PasswordManagerModule,EnvConfigModule],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
