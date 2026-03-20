import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto'
import { DatabaseType, resolveDatabaseType } from '../../config/database-type.enum'
import { Locale } from '../entities/locale.entity'

@Injectable()
export class LocaleRepository {
  private readonly dbType: DatabaseType

  constructor(
    @InjectRepository(Locale)
    private readonly repo: Repository<Locale>,
    private readonly dataSource: DataSource,
    configService: ConfigService
  ) {
    this.dbType = resolveDatabaseType(configService.get<string>('LYA_DB_TYPE'))
  }

  async findPaginated(
    page: number,
    limit: number,
    search?: string,
    direction?: 'ltr' | 'rtl'
  ): Promise<PaginatedResponseDto<Locale>> {
    if (this.dbType === DatabaseType.MONGODB) {
      const mongoRepo = this.dataSource.getMongoRepository(Locale)
      const filter: Record<string, unknown> = {}
      if (direction) filter['direction'] = direction
      if (search) {
        const regex = { $regex: search, $options: 'i' }
        // code is stored as _id in MongoDB — @PrimaryColumn() maps to _id
        filter['$or'] = [{ name: regex }, { nativeName: regex }, { _id: regex }]
      }
      const [data, total] = await Promise.all([
        mongoRepo.find({
          where: filter as never,
          order: { code: 'ASC' } as never,
          skip: (page - 1) * limit,
          take: limit,
        }),
        mongoRepo.count(filter as never),
      ])
      return new PaginatedResponseDto(data, total, page, limit)
    }

    // Postgres LIKE is case-sensitive; ILIKE is the case-insensitive equivalent.
    // MySQL/MariaDB/SQLite LIKE is case-insensitive by default.
    const likeOp = this.dbType === DatabaseType.POSTGRES ? 'ILIKE' : 'LIKE'
    const qb = this.repo.createQueryBuilder('locale')
    if (direction) qb.andWhere('locale.direction = :direction', { direction })
    if (search) {
      qb.andWhere(
        `(locale.name ${likeOp} :search OR locale.nativeName ${likeOp} :search OR locale.code ${likeOp} :search)`,
        { search: `%${search}%` }
      )
    }
    qb.orderBy('locale.code', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
    const [data, total] = await qb.getManyAndCount()
    return new PaginatedResponseDto(data, total, page, limit)
  }

  async findAllFiltered(search?: string, direction?: 'ltr' | 'rtl'): Promise<Locale[]> {
    if (this.dbType === DatabaseType.MONGODB) {
      const mongoRepo = this.dataSource.getMongoRepository(Locale)
      const filter: Record<string, unknown> = {}
      if (direction) filter['direction'] = direction
      if (search) {
        const regex = { $regex: search, $options: 'i' }
        filter['$or'] = [{ name: regex }, { nativeName: regex }, { _id: regex }]
      }
      return mongoRepo.find({ where: filter as never })
    }

    const likeOp = this.dbType === DatabaseType.POSTGRES ? 'ILIKE' : 'LIKE'
    const qb = this.repo.createQueryBuilder('locale')
    if (direction) qb.andWhere('locale.direction = :direction', { direction })
    if (search) {
      qb.andWhere(
        `(locale.name ${likeOp} :search OR locale.nativeName ${likeOp} :search OR locale.code ${likeOp} :search)`,
        { search: `%${search}%` }
      )
    }
    return qb.getMany()
  }

  findByCode(code: string): Promise<Locale | null> {
    if (this.dbType === DatabaseType.MONGODB) {
      // @PrimaryColumn() maps to _id in MongoDB — must query by _id, not by property name
      return this.dataSource.getMongoRepository(Locale).findOne({ where: { _id: code } as never })
    }
    return this.repo.findOne({ where: { code } })
  }

  count(): Promise<number> {
    if (this.dbType === DatabaseType.MONGODB) {
      return this.dataSource.getMongoRepository(Locale).count()
    }
    return this.repo.count()
  }

  async seed(locales: Partial<Locale>[]): Promise<void> {
    if (this.dbType === DatabaseType.MONGODB) {
      await this.dataSource.getMongoRepository(Locale).insertMany(locales)
      return
    }
    await this.repo.insert(locales as Locale[])
  }
}
