import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector, NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'

function setupSwagger(app: INestApplication) {
  const configService = app.get(ConfigService)
  const apiVersion = configService.get<string>('LYA_VERSION', '0.0.0')
  const apiPrefix = configService.get<string>('LYA_API_PREFIX', '/')

  const config = new DocumentBuilder()
    .setTitle('LYA API')
    .setDescription('API documentation for the LYA application')
    .setVersion(apiVersion)
    .addServer(apiPrefix)
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('/', app, document)
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  )
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

  const configService = app.get(ConfigService)

  const enableSwagger =
    configService.get('LYA_ENABLE_SWAGGER') === 'true' || configService.get('NODE_ENV') !== 'production'
  if (enableSwagger) {
    setupSwagger(app)
  }

  await app.listen(3000)
}
void bootstrap()
