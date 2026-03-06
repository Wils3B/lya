import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { GetResourceQuery } from '../get-resource.query'
import { Resource } from '../../entities/resource.entity'
import { ResourceRepository } from '../../repositories/resource.repository'

@QueryHandler(GetResourceQuery)
export class GetResourceHandler implements IQueryHandler<GetResourceQuery, Resource | null> {
  constructor(private readonly resourceRepository: ResourceRepository) {}

  async execute(query: GetResourceQuery): Promise<Resource | null> {
    return this.resourceRepository.findById(query.id)
  }
}
