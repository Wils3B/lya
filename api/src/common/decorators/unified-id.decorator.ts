import { PrimaryGeneratedColumn, ObjectIdColumn } from 'typeorm'

/**
 * A decorator that applies the appropriate TypeORM ID column decorator
 * based on the database type.
 */
export function UnifiedId() {
  return function (target: object, propertyKey: string | symbol) {
    const dbType = process.env.LYA_DB_TYPE || ''

    if (dbType === 'mongodb') {
      ObjectIdColumn()(target, propertyKey)
    } else {
      PrimaryGeneratedColumn()(target, propertyKey)
    }
  }
}
