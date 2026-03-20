import { Command } from '@nestjs/cqrs'
import { CreateOrganisationDto } from '../dto/create-organisation.dto'
import { Organisation } from '../entities/organisation.entity'

export class CreateOrganisationCommand extends Command<Organisation> {
  constructor(
    public readonly payload: CreateOrganisationDto,
    public readonly userId: string
  ) {
    super()
  }
}
