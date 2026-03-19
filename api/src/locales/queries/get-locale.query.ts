import { Query } from '@nestjs/cqrs'
import { Locale } from '../entities/locale.entity'

export class GetLocaleQuery extends Query<Locale | null> {
  constructor(public readonly code: string) {
    super()
  }
}
