import { Command } from '@nestjs/cqrs'
import { ProjectLocale } from '../entities/project-locale.entity'

export class AddLocaleCommand extends Command<ProjectLocale | null> {
  constructor(
    public readonly projectId: string,
    public readonly localeCode: string
  ) {
    super()
  }
}
