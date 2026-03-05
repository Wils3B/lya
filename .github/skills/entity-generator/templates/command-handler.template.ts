import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CreateResourceCommand } from '../create-resource.command'
import { Resource } from '../../entities/resource.entity'
import { ResourceRepository } from '../../repositories/resource.repository'

@CommandHandler(CreateResourceCommand)
export class CreateResourceHandler implements ICommandHandler<CreateResourceCommand, Resource> {
  constructor(private readonly resourceRepository: ResourceRepository) {}

  async execute(command: CreateResourceCommand): Promise<Resource> {
    const resource = this.resourceRepository.create(command.dto)
    return this.resourceRepository.save(resource)
  }
}
