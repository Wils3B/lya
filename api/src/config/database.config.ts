import { registerAs } from '@nestjs/config'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { buildDataSourceOptions } from './database-options'
import { resolveDatabaseType } from './database-type.enum'

export default registerAs('database', (): TypeOrmModuleOptions => {
  const type = resolveDatabaseType(process.env.LYA_DB_TYPE)
  return buildDataSourceOptions(type) as TypeOrmModuleOptions
})
