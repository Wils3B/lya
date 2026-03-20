import { MongoClient } from 'mongodb'
import { MigrationInterface, QueryRunner } from 'typeorm'

interface MongoDriverShape {
  queryRunner: { databaseConnection: MongoClient }
}

export class InitialIndexes1742252400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const driver = queryRunner.connection.driver as unknown as MongoDriverShape
    const collection = driver.queryRunner.databaseConnection.db().collection('user')

    // Drop any existing unique index on email (e.g. auto-created by synchronize) before creating the named one
    const indexes = await collection.indexes()
    const existingEmailIndex = indexes.find((idx) => idx['key']?.email !== undefined && idx['unique'])
    if (existingEmailIndex) {
      await collection.dropIndex(String(existingEmailIndex['name']))
    }

    await collection.createIndex({ email: 1 }, { unique: true, name: 'IDX_user_email' })
    await collection.createIndex({ username: 1 }, { unique: true, name: 'IDX_user_username' })
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const driver = queryRunner.connection.driver as unknown as MongoDriverShape
    const collection = driver.queryRunner.databaseConnection.db().collection('user')
    await collection.dropIndex('IDX_user_email')
    await collection.dropIndex('IDX_user_username')
  }
}
