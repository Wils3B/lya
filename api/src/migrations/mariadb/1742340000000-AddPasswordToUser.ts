import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddPasswordToUser1742340000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('user', [
      new TableColumn({
        name: 'password',
        type: 'varchar',
        length: '255',
        isNullable: false,
      }),
      new TableColumn({
        name: 'refreshTokenHash',
        type: 'varchar',
        length: '255',
        isNullable: true,
        default: null,
      }),
    ])
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('user', ['password', 'refreshTokenHash'])
  }
}
