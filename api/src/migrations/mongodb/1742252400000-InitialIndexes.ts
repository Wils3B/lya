import { MigrationInterface } from 'typeorm'

// For MongoDB, TypeORM's MongoSchemaBuilder always runs during DataSource.initialize()
// regardless of the `synchronize` option. It reads @Column({ unique: true }) on User.email
// and creates the unique index automatically. Manually creating a named index here would
// conflict with the schema builder's attempt to create the same key.
// The unique email constraint is fully managed by the entity decorator — no DDL needed.
export class InitialIndexes1742252400000 implements MigrationInterface {
  public async up(): Promise<void> {
    // no-op — unique email index is created by TypeORM's MongoSchemaBuilder from @Column({ unique: true })
  }

  public async down(): Promise<void> {
    // no-op
  }
}
