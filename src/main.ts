/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // Adicione esta importação

// Add type declaration for Swagger UI
declare global {
  interface Window {
    ui: {
      preauthorizeApiKey: (key: string, token: string) => void;
    };
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Configurar prefixo global da API
  app.setGlobalPrefix('api/v1');

  // Habilitar validação de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true, // Garante que os tipos são convertidos automaticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
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

  // Configuração do Swagger com base no ambiente
  const environment = configService.get<string>('NODE_ENV', 'development');
  const isProduction = environment === 'production';
  const enableSwagger =
    configService.get<string>('SWAGGER_ENABLED', 'true') === 'true';

  if (enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('QCadastro API')
      .setDescription('API para sistema de cadastro e gerenciamento')
      .setVersion('1.0')
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Insira o token JWT',
        in: 'header',
      })
      .addTag('auth', 'Endpoints de autenticação')
      .addTag('users', 'Gerenciamento de usuários')
      .addTag('portadores', 'Gerenciamento de portadores de veículos')
      .addTag('veiculos', 'Gerenciamento de veículos')
      .addTag('enderecos', 'Gerenciamento de endereços')
      .addTag('admin', 'Operações administrativas')
      .build();

    const document = SwaggerModule.createDocument(app, config);

    // Em produção, podemos adicionar configurações extras de segurança
    const swaggerOptions = {
      swaggerOptions: {
        persistAuthorization: true,
        plugins: [
          {
            // Plugin personalizado para interceptar a resposta de login
            statePlugins: {
              spec: {
                wrapActions: {
                  executeRequest:
                    (oriAction) =>
                    (...args) => {
                      return oriAction(...args).then(
                        (res: {
                          url: string;
                          status: number;
                          data: { access_token: any };
                        }) => {
                          // Verificar se é a resposta do endpoint de login
                          const path = res.url?.split('?')[0];
                          if (
                            path?.endsWith('/auth/login') &&
                            res.status === 200 &&
                            res.data?.access_token
                          ) {
                            // Extrair o token e configurar para futuros requests
                            const token = res.data.access_token;
                            window.localStorage.setItem(
                              'swagger_accessToken',
                              token,
                            );
                            window.ui.preauthorizeApiKey('bearerAuth', token);
                          }
                          return res;
                        },
                      );
                    },
                },
              },
            },
          },
        ],
        onComplete: () => {
          // Restaurar token se existir no localStorage
          const token = window.localStorage.getItem('swagger_accessToken');
          if (token) {
            window.ui.preauthorizeApiKey('bearerAuth', token);
          }
        },
      },
      customSiteTitle: 'QCadastro API Documentation',
    };

    // Se estiver em produção, adicione proteção básica
    if (isProduction) {
      app.use('/api/docs', (req, res, next) => {
        // Verificação simples com senha básica via query param
        // Em produção, considere usar JWT ou outro método mais seguro
        const apiKey =
          typeof req.query.apiKey === 'string' ? req.query.apiKey : undefined;
        if (apiKey !== configService.get('SWAGGER_API_KEY')) {
          res.status(401).send('Não autorizado');
          return;
        }
        next();
      });
    }

    SwaggerModule.setup('api/docs', app, document, swaggerOptions);
  }

  const portNumber = process.env.PORT || 3000;

  const port = configService.get<number>(
    'PORT',
    portNumber as unknown as number,
  );
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger documentation: ${await app.getUrl()}/api/docs`);
  console.log(`Environment: ${configService.get('NODE_ENV', 'development')}`);
  console.log(`Database Name: ${configService.get('DB_NAME')}`);
}
bootstrap().catch((err) => console.error('Bootstrap failed:', err));
