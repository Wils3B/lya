import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator'
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto'
import { Direction } from '../entities/direction.enum'

export class LocaleQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: Direction, description: 'Filter by text direction' })
  @IsOptional()
  @IsEnum(Direction)
  direction?: Direction

  @ApiPropertyOptional({ description: 'Search by code or name', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string
}
