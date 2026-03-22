import { ConflictException, NotFoundException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { LocaleRepository } from '../../../locales/repositories/locale.repository'
import { ProjectLocale } from '../../entities/project-locale.entity'
import { ProjectLocaleRepository } from '../../repositories/project-locale.repository'
import { ProjectRepository } from '../../repositories/project.repository'
import { AddLocaleCommand } from '../add-locale.command'

@CommandHandler(AddLocaleCommand)
export class AddLocaleHandler implements ICommandHandler<AddLocaleCommand, ProjectLocale> {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly projectLocaleRepository: ProjectLocaleRepository,
    private readonly localeRepository: LocaleRepository
  ) {}

  async execute(command: AddLocaleCommand): Promise<ProjectLocale> {
    const { projectId, localeCode } = command

    const project = await this.projectRepository.findById(projectId)
    if (!project) throw new NotFoundException(`Project ${projectId} not found`)

    const locale = await this.localeRepository.findByCode(localeCode)
    if (!locale) throw new NotFoundException(`Locale '${localeCode}' is not supported`)

    const existing = await this.projectLocaleRepository.findLocale(projectId, localeCode)
    if (existing) throw new ConflictException(`Locale '${localeCode}' is already added to this project`)

    const projectLocale = this.projectLocaleRepository.createLocale(projectId, localeCode)
    return this.projectLocaleRepository.save(projectLocale)
  }
}
