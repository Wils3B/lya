import { MongoClient } from 'mongodb'
import { MigrationInterface, QueryRunner } from 'typeorm'

interface MongoDriverShape {
  queryRunner: { databaseConnection: MongoClient }
}

// MongoDB is schemaless — no DDL needed. Create a unique index on `_id` is implicit
// since code is the primary key. This migration is a no-op for schema but serves
// as a marker that the locale collection was introduced at this point.
export class CreateLocaleCollection1742425200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const driver = queryRunner.connection.driver as unknown as MongoDriverShape
    const db = driver.queryRunner.databaseConnection.db()
    // Ensure collection exists (creating an index implicitly creates it)
    await db.collection('locale').createIndex({ code: 1 }, { unique: true, name: 'IDX_locale_code' })
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const driver = queryRunner.connection.driver as unknown as MongoDriverShape
    const db = driver.queryRunner.databaseConnection.db()
    await db.collection('locale').drop()
  }
}
