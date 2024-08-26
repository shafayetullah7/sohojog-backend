import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { EnvConfigService } from './env-config/env.config.service';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // logger: true/,
  });

  app.enableCors({
    origin: [
      'http://localhost:3000', // Your local development URL
      'https://example.com', // Your production URL
      'https://another-domain.com', // Additional trusted domains
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  app.use(helmet());


  app.use(cookieParser());

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
