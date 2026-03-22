import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Project } from '../../entities/project.entity'
import { ProjectLocaleRepository } from '../../repositories/project-locale.repository'
import { ProjectMemberRepository } from '../../repositories/project-member.repository'
import { ProjectRepository } from '../../repositories/project.repository'
import { DeleteProjectCommand } from '../delete-project.command'

@CommandHandler(DeleteProjectCommand)
export class DeleteProjectHandler implements ICommandHandler<DeleteProjectCommand, Project | null> {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly localeRepository: ProjectLocaleRepository,
    private readonly memberRepository: ProjectMemberRepository
  ) {}

  async execute(command: DeleteProjectCommand): Promise<Project | null> {
    const project = await this.projectRepository.findById(command.projectId)
    if (!project) return null

    await this.localeRepository.deleteByProjectId(command.projectId)
    await this.memberRepository.deleteByProjectId(command.projectId)
    await this.projectRepository.remove(project)

    return project
  }
}
