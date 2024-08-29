import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EnvConfigModule } from 'src/env-config/env.config.module';

@Module({
  imports: [EnvConfigModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
