import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm'

export class CreateProject1774137600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'project',
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
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'slug',
            type: 'varchar',
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

    await queryRunner.createIndex(
      'project',
      new TableIndex({
        name: 'IDX_project_org_slug',
        columnNames: ['organisationId', 'slug'],
        isUnique: true,
      })
    )

    await queryRunner.createTable(
      new Table({
        name: 'project_locale',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'projectId',
            type: 'integer',
          },
          {
            name: 'localeCode',
            type: 'varchar',
          },
          {
            name: 'addedAt',
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
      'project_locale',
      new TableIndex({
        name: 'IDX_project_locale_project_code',
        columnNames: ['projectId', 'localeCode'],
        isUnique: true,
      })
    )

    await queryRunner.createTable(
      new Table({
        name: 'project_member',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'projectId',
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
      'project_member',
      new TableIndex({
        name: 'IDX_project_member_project_user',
        columnNames: ['projectId', 'userId'],
        isUnique: true,
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('project_member')
    await queryRunner.dropTable('project_locale')
    await queryRunner.dropTable('project')
  }
}
