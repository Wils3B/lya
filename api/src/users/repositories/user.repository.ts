import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ObjectId } from 'mongodb'
import { DataSource } from 'typeorm'
import { BaseRepository } from '../../common/repositories/base.repository'
import { DatabaseType, resolveDatabaseType } from '../../config/database-type.enum'
import { User } from '../entities/user.entity'

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(dataSource: DataSource, configService: ConfigService) {
    super(User, dataSource.manager, resolveDatabaseType(configService.get<string>('LYA_DB_TYPE')))
  }

  findByEmailOrUsername(identifier: string): Promise<User | null> {
    if (this.dbType === DatabaseType.MONGODB) {
      const escaped = identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`^${escaped}$`, 'i')
      return this.manager.getMongoRepository(User).findOne({
        where: { $or: [{ email: regex }, { username: regex }] } as never,
        select: ['id', 'name', 'email', 'username', 'password', 'refreshTokenHash', 'createdAt', 'updatedAt'],
      } as never)
    }
    return this.createQueryBuilder('user')
      .addSelect('user.password')
      .addSelect('user.refreshTokenHash')
      .where('LOWER(user.email) = LOWER(:identifier) OR LOWER(user.username) = LOWER(:identifier)', { identifier })
      .getOne()
  }

  findByIdWithSecrets(id: string): Promise<User | null> {
    if (this.dbType === DatabaseType.MONGODB) {
      try {
        return this.manager.getMongoRepository(User).findOne({
          where: { _id: new ObjectId(id) },
          select: ['id', 'name', 'email', 'refreshTokenHash', 'createdAt', 'updatedAt'],
        } as never)
      } catch {
        return Promise.resolve(null)
      }
    }
    const parsedId = parseInt(id, 10)
    return this.createQueryBuilder('user')
      .addSelect('user.refreshTokenHash')
      .where('user.id = :id', { id: isNaN(parsedId) ? null : parsedId })
      .getOne()
  }

  async updateRefreshTokenHash(userId: User['id'], refreshTokenHash: string | null): Promise<void> {
    if (this.dbType === DatabaseType.MONGODB) {
      const objectId = userId instanceof ObjectId ? userId : new ObjectId(String(userId))
      const result = await this.manager
        .getMongoRepository(User)
        .updateOne({ _id: objectId }, { $set: { refreshTokenHash } })
      if (result.matchedCount === 0) throw new NotFoundException(`User ${String(userId)} not found`)
      return
    }
    const result = await this.update(userId as number, { refreshTokenHash } as Partial<User>)
    if (result.affected === 0) throw new NotFoundException(`User ${String(userId)} not found`)
  }
}
