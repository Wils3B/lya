import { ObjectId } from 'mongodb'

export function isMongoDb(): boolean {
  return process.env.LYA_DB_TYPE === 'mongodb'
}

export function getNonExistentId(): string {
  if (isMongoDb()) {
    return new ObjectId().toHexString()
  }
  return '99999'
}
