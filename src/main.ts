import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as cors from 'cors';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configurar prefixo global da API
  app.setGlobalPrefix('api/v1');

  // Habilitar validação de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Proteção de cabeçalhos HTTP
  app.use(helmet());

  // Configuração CORS - Corrigido para processar múltiplas origens
  const corsOrigins = Array.from(
    new Set(
      (configService.get<string>('CORS_ORIGINS') || '')
        .split(',')
        .map((origin) => origin.trim()),
    ),
  );

  app.use(
    cors({
      origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      preflightContinue: false,
      optionsSuccessStatus: 204,
    }),
  );

  const portNumber = process.env.PORT || 3000;

  const port = configService.get<number>(
    'PORT',
    portNumber as unknown as number,
  );
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Environment: ${configService.get('NODE_ENV', 'development')}`);
  console.log(`Database Name: ${configService.get('DB_NAME')}`);
}
bootstrap().catch((err) => console.error('Bootstrap failed:', err));
