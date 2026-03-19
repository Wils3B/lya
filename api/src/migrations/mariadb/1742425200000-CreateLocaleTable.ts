import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class CreateLocaleTable1742425200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'locale',
        columns: [
          { name: 'code', type: 'varchar', length: '20', isPrimary: true },
          { name: 'name', type: 'varchar', length: '255' },
          { name: 'nativeName', type: 'varchar', length: '255' },
          { name: 'direction', type: 'varchar', length: '3' },
        ],
      }),
      true
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('locale')
  }
}
