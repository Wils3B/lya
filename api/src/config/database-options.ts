import { join } from 'path'
import { DataSourceOptions } from 'typeorm'
import { DatabaseType } from './database-type.enum'

export function buildDataSourceOptions(type: DatabaseType): DataSourceOptions {
  const isProduction = process.env.NODE_ENV === 'production'

  const commonConfig = {
    entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    migrations: [join(__dirname, '..', 'migrations', type, '*.{ts,js}')],
    synchronize: !isProduction,
    migrationsRun: isProduction,
    logging: !isProduction,
  }

  switch (type) {
    case DatabaseType.MYSQL:
    case DatabaseType.MARIADB:
      return {
        ...commonConfig,
        type: type,
        host: process.env.LYA_DB_HOST || type,
        port: parseInt(process.env.LYA_DB_PORT, 10) || 3306,
        username: process.env.LYA_DB_USERNAME || 'root',
        password: process.env.LYA_DB_PASSWORD || 'password',
        database: process.env.LYA_DB_NAME || 'lya',
      }
    case DatabaseType.POSTGRES:
      return {
        ...commonConfig,
        type: DatabaseType.POSTGRES,
        host: process.env.LYA_DB_HOST || 'postgres',
        port: parseInt(process.env.LYA_DB_PORT, 10) || 5432,
        username: process.env.LYA_DB_USERNAME || 'postgres',
        password: process.env.LYA_DB_PASSWORD || 'postgres',
        database: process.env.LYA_DB_NAME || 'lya',
      }
    case DatabaseType.MONGODB:
      return {
        ...commonConfig,
        type: DatabaseType.MONGODB,
        url: process.env.LYA_DB_URL || 'mongodb://localhost:27017/lya',
      }
    case DatabaseType.SQLITE:
    default:
      return {
        ...commonConfig,
        type: DatabaseType.SQLITE,
        database: process.env.LYA_DB_FILE || 'lya.sqlite',
      }
  }
}
