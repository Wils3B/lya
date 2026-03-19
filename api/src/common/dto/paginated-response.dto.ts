import { ApiProperty } from '@nestjs/swagger'

export class PaginatedResponseDto<T> {
  @ApiProperty({ isArray: true })
  data: T[]

  @ApiProperty()
  total: number

  @ApiProperty()
  page: number

  @ApiProperty()
  limit: number

  @ApiProperty()
  totalPages: number

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data
    this.total = total
    this.page = page
    this.limit = limit
    this.totalPages = Math.ceil(total / limit)
  }
}
