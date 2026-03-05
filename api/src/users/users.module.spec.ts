import { MODULE_METADATA } from '@nestjs/common/constants'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CommandHandlers } from './commands/handlers'
import { QueryHandlers } from './queries/handlers'
import { UserRepository } from './repositories/user.repository'
import { UsersController } from './users.controller'
import { UsersModule } from './users.module'

describe('UsersModule', () => {
  it('registers users controller and providers', () => {
    const controllers = Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, UsersModule)
    const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, UsersModule)

    expect(controllers).toEqual([UsersController])
    expect(providers).toEqual([UserRepository, ...CommandHandlers, ...QueryHandlers])
  })

  it('imports TypeOrm feature module', () => {
    const imports = Reflect.getMetadata(MODULE_METADATA.IMPORTS, UsersModule)
    const typeOrmFeatureModule = imports.find((entry: { module?: unknown }) => entry?.module === TypeOrmModule)

    expect(typeOrmFeatureModule).toBeDefined()
  })
})
