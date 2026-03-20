import { MongoClient } from 'mongodb'
import { MigrationInterface, QueryRunner } from 'typeorm'
import { LOCALE_SEED_DATA } from '../../locales/data/locales.seed'

interface MongoDriverShape {
  queryRunner: { databaseConnection: MongoClient }
}

export class SeedLocales1742512800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const driver = queryRunner.connection.driver as unknown as MongoDriverShape
    const collection = driver.queryRunner.databaseConnection.db().collection('locale')
    // Store code as _id AND as code. TypeORM's @PrimaryColumn() writes to _id on insert but reads
    // back using the property/column name ('code'). Both fields must be present for round-trip correctness.
    // Use upsert so the migration is idempotent and safe to run against a DB with stale seed data.
    await collection.bulkWrite(
      LOCALE_SEED_DATA.map((l) => ({
        replaceOne: {
          filter: { _id: l.code as never },
          replacement: {
            _id: l.code as never,
            code: l.code,
            name: l.name,
            nativeName: l.nativeName,
            direction: l.direction,
          },
          upsert: true,
        },
      }))
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const driver = queryRunner.connection.driver as unknown as MongoDriverShape
    const collection = driver.queryRunner.databaseConnection.db().collection('locale')
    const codes = LOCALE_SEED_DATA.map((l) => l.code)
    await collection.deleteMany({ _id: { $in: codes as never[] } })
  }
}
