import { Command } from '@nestjs/cqrs'
import { UpdateOrganisationDto } from '../dto/update-organisation.dto'
import { Organisation } from '../entities/organisation.entity'

export class UpdateOrganisationCommand extends Command<Organisation | null> {
  constructor(
    public readonly id: string,
    public readonly payload: UpdateOrganisationDto
  ) {
    super()
  }
}
