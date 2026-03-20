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
    // Store code as _id — matches how TypeORM persists @PrimaryColumn() for MongoDB.
    // Do NOT include a separate `code` field: TypeORM reads _id back into the code property.
    await collection.insertMany(
      LOCALE_SEED_DATA.map((l) => ({
        _id: l.code as never,
        name: l.name,
        nativeName: l.nativeName,
        direction: l.direction,
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
