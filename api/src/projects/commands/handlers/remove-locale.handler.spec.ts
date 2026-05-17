import { ProjectLocale } from '../../entities/project-locale.entity'
import { ProjectLocaleRepository } from '../../repositories/project-locale.repository'
import { RemoveLocaleCommand } from '../remove-locale.command'
import { RemoveLocaleHandler } from './remove-locale.handler'

describe('RemoveLocaleHandler', () => {
  const projectLocale = { id: 1 } as ProjectLocale

  it('returns null when locale not found on project', async () => {
    const findLocale = jest.fn().mockResolvedValue(null)
    const remove = jest.fn()
    const repo = { findLocale, remove } as unknown as ProjectLocaleRepository

    const handler = new RemoveLocaleHandler(repo)
    const result = await handler.execute(new RemoveLocaleCommand('1', 'en'))
    expect(result).toBeNull()
    expect(remove).not.toHaveBeenCalled()
  })

  it('removes locale and returns it', async () => {
    const findLocale = jest.fn().mockResolvedValue(projectLocale)
    const remove = jest.fn().mockResolvedValue(projectLocale)
    const repo = { findLocale, remove } as unknown as ProjectLocaleRepository

    const handler = new RemoveLocaleHandler(repo)
    const result = await handler.execute(new RemoveLocaleCommand('1', 'en'))
    expect(remove).toHaveBeenCalledWith(projectLocale)
    expect(result).toBe(projectLocale)
  })
})
