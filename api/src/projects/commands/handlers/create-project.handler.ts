import { ConflictException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ProjectRole } from '../../entities/project-role.enum'
import { Project } from '../../entities/project.entity'
import { ProjectMemberRepository } from '../../repositories/project-member.repository'
import { ProjectRepository } from '../../repositories/project.repository'
import { CreateProjectCommand } from '../create-project.command'

@CommandHandler(CreateProjectCommand)
export class CreateProjectHandler implements ICommandHandler<CreateProjectCommand, Project> {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly memberRepository: ProjectMemberRepository
  ) {}

  async execute(command: CreateProjectCommand): Promise<Project> {
    const { organisationId, payload, userId } = command

    const existing = await this.projectRepository.findBySlug(organisationId, payload.slug)
    if (existing) {
      throw new ConflictException(`A project with slug '${payload.slug}' already exists in this organisation`)
    }

    const project = this.projectRepository.createProject(
      organisationId,
      payload.name,
      payload.slug,
      payload.description ?? null
    )
    const savedProject = await this.projectRepository.save(project)

    const member = this.memberRepository.createMembership(String(savedProject.id), userId, ProjectRole.MAINTAINER)
    await this.memberRepository.save(member)

    return savedProject
  }
}
