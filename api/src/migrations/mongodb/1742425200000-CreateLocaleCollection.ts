import { MigrationInterface } from 'typeorm'

// MongoDB is schemaless. The locale collection is created implicitly when
// SeedLocales inserts the first document. The BCP 47 code is stored as _id
// (TypeORM maps @PrimaryColumn() to _id for MongoDB), so uniqueness is guaranteed
// by the built-in _id index — no extra DDL is needed.
export class CreateLocaleCollection1742425200000 implements MigrationInterface {
  public async up(): Promise<void> {
    // no-op — collection and uniqueness are handled by _id
  }

  public async down(): Promise<void> {
    // no-op — collection is dropped by SeedLocales.down()
  }
}
