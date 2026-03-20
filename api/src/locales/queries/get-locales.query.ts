import { Query } from '@nestjs/cqrs'
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto'
import { Direction } from '../entities/direction.enum'
import { Locale } from '../entities/locale.entity'

export class GetLocalesQuery extends Query<PaginatedResponseDto<Locale>> {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly direction?: Direction,
    public readonly search?: string
  ) {
    super()
  }
}
