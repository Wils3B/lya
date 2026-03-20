import { Command } from '@nestjs/cqrs'
import { Organisation } from '../entities/organisation.entity'

export class DeleteOrganisationCommand extends Command<Organisation | null> {
  constructor(public readonly id: string) {
    super()
  }
}
