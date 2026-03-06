import { Command } from '@nestjs-architects/typed-cqrs'
import { CreateResourceDto } from '../dto/create-resource.dto'
import { Resource } from '../entities/resource.entity'

export class CreateResourceCommand extends Command<Resource> {
  constructor(public readonly dto: CreateResourceDto) {
    super()
  }
}
