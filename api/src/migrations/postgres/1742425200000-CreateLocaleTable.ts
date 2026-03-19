import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class CreateLocaleTable1742425200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'locale',
        columns: [
          { name: 'code', type: 'varchar', isPrimary: true },
          { name: 'name', type: 'varchar' },
          { name: 'nativeName', type: 'varchar' },
          { name: 'direction', type: 'varchar' },
        ],
      }),
      true
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('locale')
  }
}
