import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailModule } from 'src/modules/common/email/email.module';
import { EmailService } from 'src/modules/common/email/email.service';
import { PasswordManagerModule } from 'src/modules/common/password-manager/password-manager.module';
import { EnvConfigModule } from 'src/env-config/env.config.module';

@Module({
  imports: [PrismaModule, EmailModule,PasswordManagerModule,EnvConfigModule],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
