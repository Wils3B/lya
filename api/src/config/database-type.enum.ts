export enum DatabaseType {
  MARIADB = 'mariadb',
  MONGODB = 'mongodb',
  MYSQL = 'mysql',
  POSTGRES = 'postgres',
  SQLITE = 'sqlite',
}

const DATABASE_TYPES = new Set<string>(Object.values(DatabaseType))

export function resolveDatabaseType(value?: string): DatabaseType {
  if (value && DATABASE_TYPES.has(value)) {
    return value as DatabaseType
  }

  return DatabaseType.SQLITE
}
