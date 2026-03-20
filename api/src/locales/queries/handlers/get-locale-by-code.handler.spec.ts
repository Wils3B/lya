import { Direction } from '../../entities/direction.enum'
import { Locale } from '../../entities/locale.entity'
import { LocaleRepository } from '../../repositories/locale.repository'
import { GetLocaleByCodeQuery } from '../get-locale-by-code.query'
import { GetLocaleByCodeHandler } from './get-locale-by-code.handler'

const makeLocale = (code: string): Locale =>
  ({
    id: 1,
    code,
    name: 'English',
    nativeName: 'English',
    direction: Direction.LTR,
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as Locale

describe('GetLocaleByCodeHandler', () => {
  it('returns the locale when found', async () => {
    const locale = makeLocale('en')
    const findByCode = jest.fn().mockResolvedValue(locale)
    const repo = { findByCode } as unknown as LocaleRepository

    const result = await new GetLocaleByCodeHandler(repo).execute(new GetLocaleByCodeQuery('en'))

    expect(findByCode).toHaveBeenCalledWith('en')
    expect(result).toEqual(locale)
  })

  it('returns null when locale is not found', async () => {
    const findByCode = jest.fn().mockResolvedValue(null)
    const repo = { findByCode } as unknown as LocaleRepository

    const result = await new GetLocaleByCodeHandler(repo).execute(new GetLocaleByCodeQuery('xx'))

    expect(findByCode).toHaveBeenCalledWith('xx')
    expect(result).toBeNull()
  })
})
