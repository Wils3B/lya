import { MigrationInterface, QueryRunner } from 'typeorm'
import { LOCALE_SEED_DATA } from '../../locales/data/locales.seed'

export class SeedLocales1742512800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.createQueryBuilder().insert().into('locale').values(LOCALE_SEED_DATA).execute()
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const codes = LOCALE_SEED_DATA.map((l) => l.code)
    await queryRunner.manager
      .createQueryBuilder()
      .delete()
      .from('locale')
      .where('code IN (:...codes)', { codes })
      .execute()
  }
}
