import { MODULE_METADATA } from '@nestjs/common/constants'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { CqrsModule } from '@nestjs/cqrs'
import { TerminusModule } from '@nestjs/terminus'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppModule } from './app.module'
import { UsersModule } from './users/users.module'

describe('AppModule', () => {
  it('registers expected controllers and providers', () => {
    const controllers = Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, AppModule)
    const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, AppModule)

    expect(controllers).toEqual([AppController])
    expect(providers).toBeUndefined()
  })

  it('wires config, typeorm, terminus, cqrs and users modules', async () => {
    const imports = Reflect.getMetadata(MODULE_METADATA.IMPORTS, AppModule)
    const configModuleImport = await imports[0]
    const typeOrmModuleImport = imports.find((entry: { module?: unknown }) => entry?.module === TypeOrmModule)
    const terminusModuleImport = imports.find((entry: unknown) => {
      if (entry === TerminusModule) {
        return true
      }

      if (typeof entry !== 'object' || entry === null || !('module' in entry)) {
        return false
      }

      return (entry as { module?: unknown }).module === TerminusModule
    })
    const cqrsModuleImport = imports.find((entry: { module?: unknown }) => entry?.module === CqrsModule)

    expect(configModuleImport).toBeDefined()
    expect(configModuleImport.module).toBe(ConfigModule)
    expect(configModuleImport.global).toBe(true)
    expect(configModuleImport.providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ provide: 'CONFIGURATION(database)' }),
        expect.objectContaining({ provide: ConfigService }),
      ])
    )

    expect(typeOrmModuleImport).toBeDefined()
    expect(typeOrmModuleImport.imports).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          providers: expect.arrayContaining([
            expect.objectContaining({
              provide: 'TypeOrmModuleOptions',
              useFactory: expect.any(Function),
              inject: [ConfigService],
            }),
          ]),
        }),
      ])
    )

    expect(terminusModuleImport).toBeDefined()
    expect(cqrsModuleImport).toBeDefined()
    expect(imports).toContain(UsersModule)
  })
})
