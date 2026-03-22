import { ConflictException, NotFoundException } from '@nestjs/common'
import { Locale } from '../../../locales/entities/locale.entity'
import { LocaleRepository } from '../../../locales/repositories/locale.repository'
import { ProjectLocale } from '../../entities/project-locale.entity'
import { Project } from '../../entities/project.entity'
import { ProjectLocaleRepository } from '../../repositories/project-locale.repository'
import { ProjectRepository } from '../../repositories/project.repository'
import { AddLocaleCommand } from '../add-locale.command'
import { AddLocaleHandler } from './add-locale.handler'

describe('AddLocaleHandler', () => {
  const project = { id: 1 } as Project
  const locale = { code: 'en' } as Locale
  const projectLocale = { id: 1, projectId: 1, localeCode: 'en' } as ProjectLocale

  function makeRepos(
    overrides: {
      project?: Project | null
      locale?: Locale | null
      existing?: ProjectLocale | null
    } = {}
  ) {
    const projectRepo = {
      findById: jest.fn().mockResolvedValue(overrides.project !== undefined ? overrides.project : project),
    } as unknown as ProjectRepository

    const localeRepo = {
      findByCode: jest.fn().mockResolvedValue(overrides.locale !== undefined ? overrides.locale : locale),
    } as unknown as LocaleRepository

    const createLocale = jest.fn().mockReturnValue(projectLocale)
    const save = jest.fn().mockResolvedValue(projectLocale)
    const projectLocaleRepo = {
      findLocale: jest.fn().mockResolvedValue(overrides.existing !== undefined ? overrides.existing : null),
      createLocale,
      save,
    } as unknown as ProjectLocaleRepository

    return { projectRepo, localeRepo, projectLocaleRepo, createLocale, save }
  }

  it('adds locale to project', async () => {
    const { projectRepo, localeRepo, projectLocaleRepo, createLocale, save } = makeRepos()
    const handler = new AddLocaleHandler(projectRepo, projectLocaleRepo, localeRepo)
    const result = await handler.execute(new AddLocaleCommand('1', 'en'))

    expect(createLocale).toHaveBeenCalledWith('1', 'en')
    expect(save).toHaveBeenCalled()
    expect(result).toBe(projectLocale)
  })

  it('throws NotFoundException when project does not exist', async () => {
    const { projectRepo, localeRepo, projectLocaleRepo } = makeRepos({ project: null })
    const handler = new AddLocaleHandler(projectRepo, projectLocaleRepo, localeRepo)
    await expect(handler.execute(new AddLocaleCommand('1', 'en'))).rejects.toThrow(NotFoundException)
  })

  it('throws NotFoundException when locale code is not supported', async () => {
    const { projectRepo, localeRepo, projectLocaleRepo } = makeRepos({ locale: null })
    const handler = new AddLocaleHandler(projectRepo, projectLocaleRepo, localeRepo)
    await expect(handler.execute(new AddLocaleCommand('1', 'xx'))).rejects.toThrow(NotFoundException)
  })

  it('throws ConflictException when locale already added', async () => {
    const { projectRepo, localeRepo, projectLocaleRepo } = makeRepos({ existing: projectLocale })
    const handler = new AddLocaleHandler(projectRepo, projectLocaleRepo, localeRepo)
    await expect(handler.execute(new AddLocaleCommand('1', 'en'))).rejects.toThrow(ConflictException)
  })
})
