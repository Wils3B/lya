import { MongoClient } from 'mongodb'
import { MigrationInterface, QueryRunner } from 'typeorm'

interface MongoDriverShape {
  queryRunner: { databaseConnection: MongoClient }
}

export class OrganisationIndexes1774051200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const driver = queryRunner.connection.driver as unknown as MongoDriverShape
    const db = driver.queryRunner.databaseConnection.db()

    // organisation collection
    const existingOrgs = await db.listCollections({ name: 'organisation' }).toArray()
    if (existingOrgs.length === 0) {
      await db.createCollection('organisation')
    }
    const orgCollection = db.collection('organisation')
    const orgIndexes = await orgCollection.indexes()
    const existingSlugIndex = orgIndexes.find((idx) => idx['key']?.slug !== undefined && idx['unique'])
    if (existingSlugIndex) {
      await orgCollection.dropIndex(String(existingSlugIndex['name']))
    }
    await orgCollection.createIndex({ slug: 1 }, { unique: true, name: 'IDX_organisation_slug' })

    // organisation_member collection
    const existingMembers = await db.listCollections({ name: 'organisation_member' }).toArray()
    if (existingMembers.length === 0) {
      await db.createCollection('organisation_member')
    }
    const memberCollection = db.collection('organisation_member')
    const memberIndexes = await memberCollection.indexes()
    const existingComposite = memberIndexes.find(
      (idx) => idx['key']?.organisationId !== undefined && idx['key']?.userId !== undefined && idx['unique']
    )
    if (existingComposite) {
      await memberCollection.dropIndex(String(existingComposite['name']))
    }
    await memberCollection.createIndex(
      { organisationId: 1, userId: 1 },
      { unique: true, name: 'IDX_organisation_member_org_user' }
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const driver = queryRunner.connection.driver as unknown as MongoDriverShape
    const db = driver.queryRunner.databaseConnection.db()
    await db.collection('organisation').dropIndex('IDX_organisation_slug')
    await db.collection('organisation_member').dropIndex('IDX_organisation_member_org_user')
  }
}
