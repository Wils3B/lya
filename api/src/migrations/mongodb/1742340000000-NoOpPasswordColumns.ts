import { MigrationInterface } from 'typeorm'

// MongoDB is schemaless — no DDL migration needed for new fields.
// New columns (password, refreshTokenHash) are written by the application automatically.
export class NoOpPasswordColumns1742340000000 implements MigrationInterface {
  public async up(): Promise<void> {
    // no-op
  }

  public async down(): Promise<void> {
    // no-op
  }
}
