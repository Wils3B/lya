import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * MongoDB is schema-less — this migration only manages indexes.
 *
 * Use `migration:create` (not `migration:generate`) for MongoDB migrations,
 * then write the up/down methods manually using QueryRunner methods like:
 *   - queryRunner.query() with MongoDB commands
 *   - queryRunner.createCollectionIndex()
 *   - queryRunner.dropCollectionIndex()
 */
export class InitialIndexes1742252400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`db.user.createIndex({ email: 1 }, { unique: true, name: "IDX_user_email" })`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`db.user.dropIndex("IDX_user_email")`)
  }
}
