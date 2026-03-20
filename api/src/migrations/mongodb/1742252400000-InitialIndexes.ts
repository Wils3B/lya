import { MongoClient } from 'mongodb'
import { MigrationInterface, QueryRunner } from 'typeorm'

interface MongoDriverShape {
  queryRunner: { databaseConnection: MongoClient }
}

export class InitialIndexes1742252400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const driver = queryRunner.connection.driver as unknown as MongoDriverShape
    const db = driver.queryRunner.databaseConnection.db()

    await db.createCollection('user')

    const collection = db.collection('user')
    const indexes = await collection.indexes()

    for (const field of ['email', 'username'] as const) {
      const existing = indexes.find((idx) => idx['key']?.[field] !== undefined && idx['unique'])
      if (existing) {
        await collection.dropIndex(String(existing['name']))
      }
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
