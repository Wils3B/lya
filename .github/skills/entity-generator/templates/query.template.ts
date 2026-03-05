import { Query } from '@nestjs-architects/typed-cqrs'
import { Resource } from '../entities/resource.entity'

export class GetResourceQuery extends Query<Resource | null> {
  constructor(public readonly id: string) {
    super()
  }
}
