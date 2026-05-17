import { MongoClient } from 'mongodb'
import { MigrationInterface, QueryRunner } from 'typeorm'

interface MongoDriverShape {
  queryRunner: { databaseConnection: MongoClient }
}

export class ProjectIndexes1774137600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const driver = queryRunner.connection.driver as unknown as MongoDriverShape
    const db = driver.queryRunner.databaseConnection.db()

    // project collection
    const existingProjects = await db.listCollections({ name: 'project' }).toArray()
    if (existingProjects.length === 0) {
      await db.createCollection('project')
    }
    const projectCollection = db.collection('project')
    const projectIndexes = await projectCollection.indexes()
    const existingOrgSlugIndex = projectIndexes.find(
      (idx) => idx['key']?.organisationId !== undefined && idx['key']?.slug !== undefined && idx['unique']
    )
    if (existingOrgSlugIndex) {
      await projectCollection.dropIndex(String(existingOrgSlugIndex['name']))
    }
    await projectCollection.createIndex({ organisationId: 1, slug: 1 }, { unique: true, name: 'IDX_project_org_slug' })

    // project_locale collection
    const existingLocales = await db.listCollections({ name: 'project_locale' }).toArray()
    if (existingLocales.length === 0) {
      await db.createCollection('project_locale')
    }
    const localeCollection = db.collection('project_locale')
    const localeIndexes = await localeCollection.indexes()
    const existingLocaleIndex = localeIndexes.find(
      (idx) => idx['key']?.projectId !== undefined && idx['key']?.localeCode !== undefined && idx['unique']
    )
    if (existingLocaleIndex) {
      await localeCollection.dropIndex(String(existingLocaleIndex['name']))
    }
    await localeCollection.createIndex(
      { projectId: 1, localeCode: 1 },
      { unique: true, name: 'IDX_project_locale_project_code' }
    )

    // project_member collection
    const existingMembers = await db.listCollections({ name: 'project_member' }).toArray()
    if (existingMembers.length === 0) {
      await db.createCollection('project_member')
    }
    const memberCollection = db.collection('project_member')
    const memberIndexes = await memberCollection.indexes()
    const existingMemberIndex = memberIndexes.find(
      (idx) => idx['key']?.projectId !== undefined && idx['key']?.userId !== undefined && idx['unique']
    )
    if (existingMemberIndex) {
      await memberCollection.dropIndex(String(existingMemberIndex['name']))
    }
    await memberCollection.createIndex(
      { projectId: 1, userId: 1 },
      { unique: true, name: 'IDX_project_member_project_user' }
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const driver = queryRunner.connection.driver as unknown as MongoDriverShape
    const db = driver.queryRunner.databaseConnection.db()
    await db.collection('project').dropIndex('IDX_project_org_slug')
    await db.collection('project_locale').dropIndex('IDX_project_locale_project_code')
    await db.collection('project_member').dropIndex('IDX_project_member_project_user')
  }
}
