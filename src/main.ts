/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
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

  // Se estiver usando Nginx como proxy reverso, pode desabilitar o CORS no NestJS
  // já que o Nginx está configurando os cabeçalhos CORS
  // Remova ou comente essa seção:
  
  /* 
  app.enableCors({
    origin: (origin, callback) => {
      // Use Set para garantir valores únicos
      const allowedOriginsFromEnv = (configService.get<string>('CORS_ORIGINS') || '')
        .split(',')
        .map(o => o.trim())
        .filter(Boolean);
      
      const allowedOriginsSet = new Set([
        ...allowedOriginsFromEnv,
      ]);
      
      const allowedOrigins = Array.from(allowedOriginsSet);
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`Origem bloqueada pelo CORS: ${origin}`);
        callback(null, false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  });
  */
  
  // Alternativamente, se preferir manter o CORS no NestJS, remova a configuração do Nginx

  // Configurar arquivos estáticos sem adicionar cabeçalhos CORS duplicados
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

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
