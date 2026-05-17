import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm'

export class CreateProject1774137600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'project',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'organisationId',
            type: 'int',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
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
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'projectId',
            type: 'int',
          },
          {
            name: 'localeCode',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'addedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
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
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'projectId',
            type: 'int',
          },
          {
            name: 'userId',
            type: 'int',
          },
          {
            name: 'role',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'joinedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
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
