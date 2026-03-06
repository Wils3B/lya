import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CommandHandlers } from './commands/handlers'
import { Resource } from './entities/resource.entity'
import { QueryHandlers } from './queries/handlers'
import { ResourceRepository } from './repositories/resource.repository'
import { ResourcesController } from './resources.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Resource])],
  controllers: [ResourcesController],
  providers: [ResourceRepository, ...CommandHandlers, ...QueryHandlers],
})
export class ResourcesModule {}
