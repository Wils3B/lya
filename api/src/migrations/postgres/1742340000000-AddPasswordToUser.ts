import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddPasswordToUser1742340000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('user', [
      new TableColumn({
        name: 'username',
        type: 'varchar',
        isNullable: false,
        isUnique: true,
      }),
      new TableColumn({
        name: 'password',
        type: 'varchar',
        isNullable: false,
      }),
      new TableColumn({
        name: 'refreshTokenHash',
        type: 'varchar',
        isNullable: true,
        default: null,
      }),
    ])
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('user', ['username', 'password', 'refreshTokenHash'])
  }
}
