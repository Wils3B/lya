import { DatabaseType } from './database-type.enum'
import databaseConfig from './database.config'

describe('databaseConfig', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.LYA_DB_TYPE
    delete process.env.LYA_DB_HOST
    delete process.env.LYA_DB_PORT
    delete process.env.LYA_DB_USERNAME
    delete process.env.LYA_DB_PASSWORD
    delete process.env.LYA_DB_NAME
    delete process.env.LYA_DB_URL
    delete process.env.LYA_DB_FILE
    delete process.env.NODE_ENV
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('returns sqlite config by default when db type is missing', () => {
    const config = databaseConfig()

    expect(config.type).toBe(DatabaseType.SQLITE)
    expect(config.database).toBe('lya.sqlite')
  })

  it('returns mysql config with defaults', () => {
    process.env.LYA_DB_TYPE = DatabaseType.MYSQL

    const config = databaseConfig()

    expect(config.type).toBe(DatabaseType.MYSQL)
    expect(config.host).toBe(DatabaseType.MYSQL)
    expect(config.port).toBe(3306)
    expect(config.username).toBe('root')
    expect(config.password).toBe('password')
    expect(config.database).toBe('lya')
  })

  it('returns postgres config with defaults', () => {
    process.env.LYA_DB_TYPE = DatabaseType.POSTGRES

    const config = databaseConfig()

    expect(config.type).toBe(DatabaseType.POSTGRES)
    expect(config.host).toBe('postgres')
    expect(config.port).toBe(5432)
    expect(config.username).toBe('postgres')
    expect(config.password).toBe('postgres')
    expect(config.database).toBe('lya')
  })

  it('returns mongodb config with fallback url', () => {
    process.env.LYA_DB_TYPE = DatabaseType.MONGODB

    const config = databaseConfig()

    expect(config.type).toBe(DatabaseType.MONGODB)
    expect(config.url).toBe('mongodb://localhost:27017/lya')
  })

  it('disables synchronize and logging in production', () => {
    process.env.NODE_ENV = 'production'

    const config = databaseConfig()

    expect(config.synchronize).toBe(false)
    expect(config.logging).toBe(false)
  })
})
