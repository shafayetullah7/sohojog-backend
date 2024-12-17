import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { EnvConfigModule } from 'src/env-config/env.config.module';

@Module({
  providers: [ConfigService],
  imports: [EnvConfigModule],
})
export class ConfigModule {}
