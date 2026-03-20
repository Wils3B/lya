import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { LOCALES_SEED } from './data/locales.data'
import { LocaleRepository } from './repositories/locale.repository'

@Injectable()
export class LocalesSeeder implements OnModuleInit {
  private readonly logger = new Logger(LocalesSeeder.name)

  constructor(private readonly localeRepository: LocaleRepository) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.localeRepository.upsertLocales(LOCALES_SEED)
      this.logger.log(`Locales seeded (${LOCALES_SEED.length} entries)`)
    } catch (error) {
      this.logger.error('Failed to seed locales', error)
    }
  }
}
