import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { CqrsModule } from '@nestjs/cqrs'
import { TerminusModule } from '@nestjs/terminus'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import databaseConfig from './config/database.config'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [databaseConfig],
      envFilePath: ['.env', `.env.${process.env.NODE_ENV || 'development'}`, '.env.database'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('database'),
    }),
    TerminusModule,
    CqrsModule.forRoot(),
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
