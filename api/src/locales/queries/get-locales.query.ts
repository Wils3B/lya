import { Query } from '@nestjs/cqrs'
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto'
import { Locale } from '../entities/locale.entity'

export class GetLocalesQuery extends Query<PaginatedResponseDto<Locale> | Locale[]> {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly pagination: boolean,
    public readonly search?: string,
    public readonly direction?: 'ltr' | 'rtl'
  ) {
    super()
  }
}
