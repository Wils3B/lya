/**
 * Standalone DataSource configuration for TypeORM CLI.
 *
 * Used by: typeorm-ts-node-commonjs -d src/config/data-source.ts
 *
 * IMPORTANT: Do NOT add direct entity imports to this file.
 * Entities are discovered via glob patterns in buildDataSourceOptions().
 * The dotenv calls below MUST execute before TypeORM resolves entity globs,
 * because @UnifiedId() reads LYA_DB_TYPE at decoration time.
 */

// eslint-disable-next-line import/order
import { config } from 'dotenv'

config()
config({ path: '.env.database', override: true })

import { DataSource } from 'typeorm'
import { buildDataSourceOptions } from './database-options'
import { resolveDatabaseType } from './database-type.enum'

const type = resolveDatabaseType(process.env.LYA_DB_TYPE)

export default new DataSource(buildDataSourceOptions(type))
