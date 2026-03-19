import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto'
import { Locale } from '../../entities/locale.entity'
import { LocaleRepository } from '../../repositories/locale.repository'
import { GetLocalesQuery } from '../get-locales.query'
import { GetLocalesHandler } from './get-locales.handler'

const EN: Locale = { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' }
const AR: Locale = { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl' }

describe('GetLocalesHandler', () => {
  it('returns paginated response by default', async () => {
    const paginated = new PaginatedResponseDto([EN], 1, 1, 20)
    const findPaginatedMock = jest.fn().mockResolvedValue(paginated)
    const repo = { findPaginated: findPaginatedMock, findAllFiltered: jest.fn() } as unknown as LocaleRepository

    const handler = new GetLocalesHandler(repo)
    const result = await handler.execute(new GetLocalesQuery(1, 20, true))

    expect(findPaginatedMock).toHaveBeenCalledWith(1, 20, undefined, undefined)
    expect(result).toEqual(paginated)
  })

  it('returns raw array when pagination=false', async () => {
    const findAllFilteredMock = jest.fn().mockResolvedValue([EN, AR])
    const repo = { findPaginated: jest.fn(), findAllFiltered: findAllFilteredMock } as unknown as LocaleRepository

    const handler = new GetLocalesHandler(repo)
    const result = await handler.execute(new GetLocalesQuery(1, 20, false))

    expect(findAllFilteredMock).toHaveBeenCalledWith(undefined, undefined)
    expect(result).toEqual([EN, AR])
  })

  it('passes search and direction filters to findPaginated', async () => {
    const paginated = new PaginatedResponseDto([AR], 1, 1, 20)
    const findPaginatedMock = jest.fn().mockResolvedValue(paginated)
    const repo = { findPaginated: findPaginatedMock, findAllFiltered: jest.fn() } as unknown as LocaleRepository

    const handler = new GetLocalesHandler(repo)
    await handler.execute(new GetLocalesQuery(1, 20, true, 'arabic', 'rtl'))

    expect(findPaginatedMock).toHaveBeenCalledWith(1, 20, 'arabic', 'rtl')
  })

  it('passes search and direction filters to findAllFiltered', async () => {
    const findAllFilteredMock = jest.fn().mockResolvedValue([AR])
    const repo = { findPaginated: jest.fn(), findAllFiltered: findAllFilteredMock } as unknown as LocaleRepository

    const handler = new GetLocalesHandler(repo)
    await handler.execute(new GetLocalesQuery(1, 20, false, 'arabic', 'rtl'))

    expect(findAllFilteredMock).toHaveBeenCalledWith('arabic', 'rtl')
  })
})
