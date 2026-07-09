import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { abortOnError: false });
  const config = app.get(ConfigService);

  app.use(helmet());
  // APP_URL is a comma-separated allowlist of frontend origins.
  const appUrl = config.get<string>('APP_URL');
  const origin = appUrl
    ? appUrl.split(',').map((o) => o.trim()).filter(Boolean)
    : true;
  app.enableCors({ origin, credentials: true });
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  // Served at /api/docs (JSON at /api/docs-json). Bearer auth so protected
  // routes are callable from the UI after pasting an access token.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Church Management Platform API')
    .setDescription('Auth, users, invites, churches, departments.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = config.get<number>('PORT') ?? 4000;
  await app.listen(port);
}
void bootstrap();
