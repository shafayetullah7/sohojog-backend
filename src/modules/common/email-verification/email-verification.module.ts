import { Module } from '@nestjs/common';
import { EmailVerificationService } from './email-verification.service';
import { EnvConfigModule } from 'src/env-config/env.config.module';

@Module({
  imports: [EnvConfigModule],
  providers: [EmailVerificationService],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
