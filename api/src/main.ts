import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

function setupSwagger(app: INestApplication) {
  const apiVersion = process.env.LYA_VERSION ?? '0.0.0';
  const apiPrefix = process.env.LYA_API_PREFIX ?? '/';

  const config = new DocumentBuilder()
    .setTitle('LYA API')
    .setDescription('API documentation for the LYA application')
    .setVersion(apiVersion)
    .addServer(apiPrefix)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, document);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupSwagger(app);
  await app.listen(3000);
}
bootstrap();
