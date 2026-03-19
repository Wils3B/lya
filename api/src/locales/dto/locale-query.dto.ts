import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator'
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto'

export class LocaleQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by name, native name, or code' })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ enum: ['ltr', 'rtl'], description: 'Filter by text direction' })
  @IsOptional()
  @IsIn(['ltr', 'rtl'])
  direction?: 'ltr' | 'rtl'

  @ApiPropertyOptional({ default: true, description: 'Return paginated response. Set to false for full list.' })
  @IsOptional()
  @Transform(({ value }) => value !== 'false' && value !== false)
  @IsBoolean()
  pagination: boolean = true
}
