import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto'
import { Direction } from '../../entities/direction.enum'
import { Locale } from '../../entities/locale.entity'
import { LocaleRepository } from '../../repositories/locale.repository'
import { GetLocalesQuery } from '../get-locales.query'
import { GetLocalesHandler } from './get-locales.handler'

const makeLocale = (code: string, direction: Direction): Locale =>
  ({
    id: 1,
    code,
    name: 'English',
    nativeName: 'English',
    direction,
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as Locale

describe('GetLocalesHandler', () => {
  it('returns paginated locales without filters', async () => {
    const locales = [makeLocale('en', Direction.LTR)]
    const paginated = new PaginatedResponseDto(locales, 1, 1, 20)
    const findPaginatedFiltered = jest.fn().mockResolvedValue(paginated)
    const repo = { findPaginatedFiltered } as unknown as LocaleRepository

    const result = await new GetLocalesHandler(repo).execute(new GetLocalesQuery(1, 20))

    expect(findPaginatedFiltered).toHaveBeenCalledWith(1, 20, undefined, undefined)
    expect(result).toEqual(paginated)
  })

  it('passes direction filter to repository', async () => {
    const locales = [makeLocale('ar', Direction.RTL)]
    const paginated = new PaginatedResponseDto(locales, 1, 1, 20)
    const findPaginatedFiltered = jest.fn().mockResolvedValue(paginated)
    const repo = { findPaginatedFiltered } as unknown as LocaleRepository

    await new GetLocalesHandler(repo).execute(new GetLocalesQuery(1, 20, Direction.RTL))

    expect(findPaginatedFiltered).toHaveBeenCalledWith(1, 20, Direction.RTL, undefined)
  })

  it('passes search term to repository', async () => {
    const paginated = new PaginatedResponseDto([], 0, 1, 20)
    const findPaginatedFiltered = jest.fn().mockResolvedValue(paginated)
    const repo = { findPaginatedFiltered } as unknown as LocaleRepository

    await new GetLocalesHandler(repo).execute(new GetLocalesQuery(1, 20, undefined, 'french'))

    expect(findPaginatedFiltered).toHaveBeenCalledWith(1, 20, undefined, 'french')
  })

  it('passes both direction and search to repository', async () => {
    const paginated = new PaginatedResponseDto([], 0, 1, 20)
    const findPaginatedFiltered = jest.fn().mockResolvedValue(paginated)
    const repo = { findPaginatedFiltered } as unknown as LocaleRepository

    await new GetLocalesHandler(repo).execute(new GetLocalesQuery(2, 10, Direction.LTR, 'fr'))

    expect(findPaginatedFiltered).toHaveBeenCalledWith(2, 10, Direction.LTR, 'fr')
  })
})
