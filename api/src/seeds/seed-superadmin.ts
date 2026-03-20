import { join } from 'path'

// Must load env before TypeORM imports — @UnifiedId() reads LYA_DB_TYPE at decoration time.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const dotenv = require('dotenv') as typeof import('dotenv')

dotenv.config({ path: join(__dirname, '..', '..', '.env') })
dotenv.config({ path: join(__dirname, '..', '..', `.env.${process.env.NODE_ENV || 'development'}`) })
dotenv.config({ path: join(__dirname, '..', '..', '.env.database') })

// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require('bcrypt') as typeof import('bcrypt')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { DataSource } = require('typeorm') as typeof import('typeorm')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { buildDataSourceOptions } = require('../config/database-options') as typeof import('../config/database-options')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { User } = require('../users/entities/user.entity') as typeof import('../users/entities/user.entity')

async function seedSuperAdmin(): Promise<void> {
  const password = process.env.LYA_SUPERADMIN_PASSWORD
  const email = process.env.LYA_SUPERADMIN_EMAIL ?? 'superadmin@lya.app'
  const name = process.env.LYA_SUPERADMIN_NAME ?? 'Super Admin'
  const username = process.env.LYA_SUPERADMIN_USERNAME ?? 'superadmin'

  if (!password?.trim()) {
    console.error('Error: LYA_SUPERADMIN_PASSWORD is not set or empty. Set it and re-run.')
    process.exit(1)
  }

  const dataSource = new DataSource(buildDataSourceOptions(process.env.LYA_DB_TYPE))
  await dataSource.initialize()

  try {
    const repo = dataSource.getRepository(User)
    const existing = await repo.findOne({ where: [{ email }, { username }] as never })

    if (existing) {
      console.log(`Superadmin already exists (${email}). Nothing to do.`)
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = repo.create({ name, username, email, password: hashedPassword })
    await repo.save(user)
    console.log(`Superadmin created successfully (${email}, @${username}).`)
  } finally {
    await dataSource.destroy()
  }
}

seedSuperAdmin().catch((err: unknown) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
