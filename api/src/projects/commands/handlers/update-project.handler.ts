import { ConflictException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Project } from '../../entities/project.entity'
import { ProjectRepository } from '../../repositories/project.repository'
import { UpdateProjectCommand } from '../update-project.command'

@CommandHandler(UpdateProjectCommand)
export class UpdateProjectHandler implements ICommandHandler<UpdateProjectCommand, Project | null> {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(command: UpdateProjectCommand): Promise<Project | null> {
    const { projectId, organisationId, payload } = command

    const project = await this.projectRepository.findById(projectId)
    if (!project) return null

    if (payload.slug && payload.slug !== project.slug) {
      const conflicting = await this.projectRepository.findBySlug(organisationId, payload.slug)
      if (conflicting) {
        throw new ConflictException(`A project with slug '${payload.slug}' already exists in this organisation`)
      }
    }

    if (payload.name !== undefined) project.name = payload.name
    if (payload.slug !== undefined) project.slug = payload.slug
    if (payload.description !== undefined) project.description = payload.description ?? null

    return this.projectRepository.save(project)
  }
}
