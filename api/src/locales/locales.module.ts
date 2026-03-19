import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Locale } from './entities/locale.entity'
import { LocalesController } from './locales.controller'
import { QueryHandlers } from './queries/handlers'
import { LocaleRepository } from './repositories/locale.repository'

@Module({
  imports: [TypeOrmModule.forFeature([Locale])],
  controllers: [LocalesController],
  providers: [LocaleRepository, ...QueryHandlers],
  exports: [LocaleRepository],
})
export class LocalesModule {}
