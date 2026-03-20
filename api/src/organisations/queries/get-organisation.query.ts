import { Query } from '@nestjs/cqrs'
import { Organisation } from '../entities/organisation.entity'

export class GetOrganisationQuery extends Query<Organisation | null> {
  constructor(public readonly identifier: string) {
    super()
  }
}
