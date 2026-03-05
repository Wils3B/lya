import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DataSource } from 'typeorm'
import { BaseRepository } from '../../common/repositories/base.repository'
import { resolveDatabaseType } from '../../config/database-type.enum'
import { User } from '../entities/user.entity'

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(dataSource: DataSource, configService: ConfigService) {
    super(User, dataSource.manager, resolveDatabaseType(configService.get<string>('LYA_DB_TYPE')))
  }
}
