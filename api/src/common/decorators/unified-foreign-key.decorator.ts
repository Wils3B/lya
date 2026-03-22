import { Column } from 'typeorm'
import { DatabaseType, resolveDatabaseType } from '../../config/database-type.enum'

/**
 * A decorator that applies the appropriate TypeORM column decorator for a foreign key
 * based on the database type. SQL databases use an integer column; MongoDB stores
 * ObjectId values and does not need a typed integer column.
 */
export function UnifiedForeignKey() {
  return function (target: object, propertyKey: string | symbol) {
    const dbType = resolveDatabaseType(process.env.LYA_DB_TYPE)

    if (dbType === DatabaseType.MONGODB) {
      Column({ nullable: false })(target, propertyKey)
    } else {
      Column({ type: 'int', nullable: false })(target, propertyKey)
    }
  }
}
