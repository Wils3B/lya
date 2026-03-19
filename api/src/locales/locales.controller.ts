import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto'
import { LocaleQueryDto } from './dto/locale-query.dto'
import { Locale } from './entities/locale.entity'
import { GetLocaleQuery, GetLocalesQuery } from './queries'

@ApiTags('locales')
@Controller('locales')
export class LocalesController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Get locales (paginated by default, set pagination=false for full list)' })
  @Get()
  findMany(@Query() query: LocaleQueryDto): Promise<PaginatedResponseDto<Locale> | Locale[]> {
    return this.queryBus.execute<PaginatedResponseDto<Locale> | Locale[]>(
      new GetLocalesQuery(query.page, query.limit, query.pagination, query.search, query.direction)
    )
  }

  @ApiOperation({ summary: 'Get a locale by BCP 47 code' })
  @Get(':code')
  async findOne(@Param('code') code: string): Promise<Locale> {
    const locale = await this.queryBus.execute<Locale | null>(new GetLocaleQuery(code))
    if (!locale) {
      throw new NotFoundException(`Locale with code '${code}' not found`)
    }
    return locale
  }
}
