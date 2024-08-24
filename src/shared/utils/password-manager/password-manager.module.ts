import { Module } from '@nestjs/common';
import { PasswordManagerService } from './password-manager.service';
import { EnvConfigModule } from 'src/env-config/env.config.module';

@Module({
  imports: [EnvConfigModule],
  providers: [PasswordManagerService],
  exports: [PasswordManagerService],
})
export class PasswordManagerModule {}
