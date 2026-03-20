import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DataSource, FindOptionsWhere } from 'typeorm'
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto'
import { BaseRepository } from '../../common/repositories/base.repository'
import { DatabaseType, resolveDatabaseType } from '../../config/database-type.enum'
import { LocaleSeedEntry } from '../data/locales.data'
import { Direction } from '../entities/direction.enum'
import { Locale } from '../entities/locale.entity'

@Injectable()
export class LocaleRepository extends BaseRepository<Locale> {
  constructor(dataSource: DataSource, configService: ConfigService) {
    super(Locale, dataSource.manager, resolveDatabaseType(configService.get<string>('LYA_DB_TYPE')))
  }

  findByCode(code: string): Promise<Locale | null> {
    return this.findOne({ where: { code } as FindOptionsWhere<Locale> })
  }

  async findPaginatedFiltered(
    page: number,
    limit: number,
    direction?: Direction,
    search?: string
  ): Promise<PaginatedResponseDto<Locale>> {
    if (this.dbType === DatabaseType.MONGODB) {
      return this.findPaginatedFilteredMongo(page, limit, direction, search)
    }

    const qb = this.createQueryBuilder('locale')

    if (direction) {
      qb.andWhere('locale.direction = :direction', { direction })
    }

    if (search) {
      qb.andWhere('(LOWER(locale.code) LIKE LOWER(:search) OR LOWER(locale.name) LIKE LOWER(:search))', {
        search: `%${search}%`,
      })
    }

    qb.orderBy('locale.code', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)

    const [data, total] = await qb.getManyAndCount()
    return new PaginatedResponseDto(data, total, page, limit)
  }

  private async findPaginatedFilteredMongo(
    page: number,
    limit: number,
    direction?: Direction,
    search?: string
  ): Promise<PaginatedResponseDto<Locale>> {
    const mongoRepo = this.manager.getMongoRepository(Locale)
    const filter: Record<string, unknown> = {}

    if (direction) {
      filter['direction'] = direction
    }

    if (search) {
      const safeSearch = this.escapeRegex(search)
      filter['$or'] = [{ code: { $regex: safeSearch, $options: 'i' } }, { name: { $regex: safeSearch, $options: 'i' } }]
    }

    const [data, total] = await Promise.all([
      mongoRepo.find({ where: filter as never, skip: (page - 1) * limit, take: limit, order: { code: 'asc' } }),
      mongoRepo.count(filter as never),
    ])

    return new PaginatedResponseDto(data, total, page, limit)
  }

  async upsertLocales(locales: LocaleSeedEntry[]): Promise<void> {
    if (this.dbType === DatabaseType.MONGODB) {
      const mongoRepo = this.manager.getMongoRepository(Locale)
      for (const locale of locales) {
        const { code, ...fields } = locale
        await mongoRepo.updateOne({ code }, { $set: fields }, { upsert: true })
      }
      return
    }

    await this.upsert(locales, { conflictPaths: ['code'], skipUpdateIfNoValuesChanged: true })
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
}
