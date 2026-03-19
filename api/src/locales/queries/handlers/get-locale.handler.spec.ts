import { Locale } from '../../entities/locale.entity'
import { LocaleRepository } from '../../repositories/locale.repository'
import { GetLocaleQuery } from '../get-locale.query'
import { GetLocaleHandler } from './get-locale.handler'

describe('GetLocaleHandler', () => {
  it('returns null when locale does not exist', async () => {
    const findByCodeMock = jest.fn().mockResolvedValue(null)
    const repo = { findByCode: findByCodeMock } as unknown as LocaleRepository

    const handler = new GetLocaleHandler(repo)
    const result = await handler.execute(new GetLocaleQuery('xx'))

    expect(findByCodeMock).toHaveBeenCalledWith('xx')
    expect(result).toBeNull()
  })

  it('returns locale when found', async () => {
    const locale = { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' } as Locale
    const findByCodeMock = jest.fn().mockResolvedValue(locale)
    const repo = { findByCode: findByCodeMock } as unknown as LocaleRepository

    const handler = new GetLocaleHandler(repo)
    const result = await handler.execute(new GetLocaleQuery('en'))

    expect(findByCodeMock).toHaveBeenCalledWith('en')
    expect(result).toEqual(locale)
  })
})
