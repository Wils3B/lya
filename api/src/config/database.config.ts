import { registerAs } from '@nestjs/config'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { buildDataSourceOptions } from './database-options'

export default registerAs('database', (): TypeOrmModuleOptions => buildDataSourceOptions(process.env.LYA_DB_TYPE))
