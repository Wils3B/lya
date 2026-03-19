import { join } from 'path'

// Must load env before TypeORM imports — @UnifiedId() reads LYA_DB_TYPE at decoration time.
// require() is used instead of import so that dotenv.config() executes before TypeORM loads:
// ES module imports are hoisted, so any import statement would be evaluated before this code runs.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const dotenv = require('dotenv') as typeof import('dotenv')

dotenv.config({ path: join(__dirname, '..', '..', '.env') })
dotenv.config({ path: join(__dirname, '..', '..', '.env.database') })

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { DataSource } = require('typeorm') as typeof import('typeorm')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { buildDataSourceOptions } = require('./database-options') as typeof import('./database-options')

export const AppDataSource = new DataSource(buildDataSourceOptions(process.env.LYA_DB_TYPE))
