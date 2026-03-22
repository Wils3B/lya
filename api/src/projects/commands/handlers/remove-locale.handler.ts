import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ProjectLocale } from '../../entities/project-locale.entity'
import { ProjectLocaleRepository } from '../../repositories/project-locale.repository'
import { RemoveLocaleCommand } from '../remove-locale.command'

@CommandHandler(RemoveLocaleCommand)
export class RemoveLocaleHandler implements ICommandHandler<RemoveLocaleCommand, ProjectLocale | null> {
  constructor(private readonly projectLocaleRepository: ProjectLocaleRepository) {}

  async execute(command: RemoveLocaleCommand): Promise<ProjectLocale | null> {
    const locale = await this.projectLocaleRepository.findLocale(command.projectId, command.localeCode)
    if (!locale) return null

    await this.projectLocaleRepository.remove(locale)
    return locale
  }
}
