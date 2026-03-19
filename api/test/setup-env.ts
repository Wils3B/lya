import { resolve } from 'path'
import dotenv from 'dotenv'

// Load env files before any test module imports.
// Dotenv does NOT override already-set vars, so inline env vars (e.g. LYA_DB_TYPE=postgres pnpm test:e2e)
// take precedence. This fallback covers the case where no env vars were set explicitly.
for (const file of ['.env', '.env.test', '.env.database']) {
  dotenv.config({ path: resolve(process.cwd(), file) })
}

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test'
}
