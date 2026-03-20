import { INestApplication } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { OrganisationMember } from '../../src/organisations/entities/organisation-member.entity'
import { Organisation } from '../../src/organisations/entities/organisation.entity'
import { User } from '../../src/users/entities/user.entity'

const ENTITIES = [OrganisationMember, Organisation, User] as const

export async function cleanDatabase(app: INestApplication): Promise<void> {
  const dataSource = app.get(DataSource)

  if (process.env.LYA_DB_TYPE === 'mongodb') {
    for (const entity of ENTITIES) {
      await dataSource.getMongoRepository(entity).deleteMany({})
    }
  } else {
    for (const entity of ENTITIES) {
      await dataSource.getRepository(entity).createQueryBuilder().delete().execute()
    }
  }
}
