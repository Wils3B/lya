import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseRepository } from '../../common/repositories/base.repository'
import { Resource } from '../entities/resource.entity'

@Injectable()
export class ResourceRepository extends BaseRepository<Resource> {
  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
  ) {
    super(resourceRepository)
  }

  // Add custom query methods here if needed
  // Example:
  // async findByName(name: string): Promise<Resource | null> {
  //   return this.resourceRepository.findOne({ where: { name } })
  // }
}
