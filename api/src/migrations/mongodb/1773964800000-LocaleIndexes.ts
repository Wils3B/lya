import { MongoClient } from 'mongodb'
import { MigrationInterface, QueryRunner } from 'typeorm'

interface MongoDriverShape {
  queryRunner: { databaseConnection: MongoClient }
}

export class LocaleIndexes1773964800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const driver = queryRunner.connection.driver as unknown as MongoDriverShape
    const db = driver.queryRunner.databaseConnection.db()

    await db.createCollection('locale')

    const collection = db.collection('locale')
    const indexes = await collection.indexes()

    const existingCodeIndex = indexes.find((idx) => idx['key']?.code !== undefined && idx['unique'])
    if (existingCodeIndex) {
      await collection.dropIndex(String(existingCodeIndex['name']))
    }

    await collection.createIndex({ code: 1 }, { unique: true, name: 'IDX_locale_code' })
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const driver = queryRunner.connection.driver as unknown as MongoDriverShape
    const collection = driver.queryRunner.databaseConnection.db().collection('locale')
    await collection.dropIndex('IDX_locale_code')
  }
}
