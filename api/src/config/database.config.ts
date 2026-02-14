import { join } from 'path'
import { registerAs } from '@nestjs/config'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'

export default registerAs('database', (): TypeOrmModuleOptions => {
  const type = process.env.LYA_DB_TYPE || 'sqlite'

  const commonConfig = {
    entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    synchronize: process.env.NODE_ENV !== 'production', // Use migrations in production!
    logging: process.env.NODE_ENV !== 'production',
  }

  switch (type) {
    case 'mysql':
    case 'mariadb':
      return {
        ...commonConfig,
        type: type,
        host: process.env.LYA_DB_HOST || type,
        port: parseInt(process.env.LYA_DB_PORT, 10) || 3306,
        username: process.env.LYA_DB_USERNAME || 'root',
        password: process.env.LYA_DB_PASSWORD || 'password',
        database: process.env.LYA_DB_NAME || 'lya',
      }
    case 'postgres':
      return {
        ...commonConfig,
        type: 'postgres',
        host: process.env.LYA_DB_HOST || 'postgres',
        port: parseInt(process.env.LYA_DB_PORT, 10) || 5432,
        username: process.env.LYA_DB_USERNAME || 'postgres',
        password: process.env.LYA_DB_PASSWORD || 'postgres',
        database: process.env.LYA_DB_NAME || 'lya',
      }
    case 'mongodb':
      return {
        ...commonConfig,
        type: 'mongodb',
        url: process.env.LYA_DB_URL || 'mongodb://localhost:27017/lya',
      }
    case 'sqlite':
    default:
      return {
        ...commonConfig,
        type: 'sqlite',
        database: process.env.LYA_DB_FILE || 'lya.sqlite',
      }
  }
})
