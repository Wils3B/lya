import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Locale } from './entities/locale.entity'
import { LocalesController } from './locales.controller'
import { LocalesSeeder } from './locales.seeder'
import { QueryHandlers } from './queries/handlers'
import { LocaleRepository } from './repositories/locale.repository'

@Module({
  imports: [TypeOrmModule.forFeature([Locale]), CqrsModule],
  controllers: [LocalesController],
  providers: [LocaleRepository, LocalesSeeder, ...QueryHandlers],
})
export class LocalesModule {}
