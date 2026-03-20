import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm'

export class CreateOrganisation1774051200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'organisation',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'slug',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true
    )

    await queryRunner.createTable(
      new Table({
        name: 'organisation_member',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'organisationId',
            type: 'integer',
          },
          {
            name: 'userId',
            type: 'integer',
          },
          {
            name: 'role',
            type: 'varchar',
          },
          {
            name: 'joinedAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true
    )

    await queryRunner.createIndex(
      'organisation_member',
      new TableIndex({
        name: 'IDX_organisation_member_org_user',
        columnNames: ['organisationId', 'userId'],
        isUnique: true,
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('organisation_member')
    await queryRunner.dropTable('organisation')
  }
}
