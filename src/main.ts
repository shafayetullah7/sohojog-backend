import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { EnvConfigService } from './env-config/env.config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // logger: true/,
  });

  app.enableCors();

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/v',
    defaultVersion: '1',
  });

  const configService = app.get(EnvConfigService);
  const port = configService.port;
  await app.listen(port);
}
bootstrap();
