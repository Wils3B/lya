import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'
import { CurrentUserPayload } from '../../auth/decorators/current-user.decorator'
import { OrganisationRole } from '../../organisations/entities/organisation-member.entity'
import { OrganisationMemberRepository } from '../../organisations/repositories/organisation-member.repository'
import { OrganisationRepository } from '../../organisations/repositories/organisation.repository'
import { REQUIRED_PROJECT_ROLE_KEY } from '../decorators/required-project-role.decorator'
import { ProjectRole } from '../entities/project-role.enum'
import { Project } from '../entities/project.entity'
import { ProjectMemberRepository } from '../repositories/project-member.repository'
import { ProjectRepository } from '../repositories/project.repository'

const PROJECT_ROLE_RANK: Record<ProjectRole, number> = {
  [ProjectRole.MAINTAINER]: 2,
  [ProjectRole.CONTRIBUTOR]: 1,
}

@Injectable()
export class ProjectRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly orgMemberRepository: OrganisationMemberRepository,
    private readonly orgRepository: OrganisationRepository,
    private readonly projectMemberRepository: ProjectMemberRepository,
    private readonly projectRepository: ProjectRepository
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRole = this.reflector.getAllAndOverride<ProjectRole>(REQUIRED_PROJECT_ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRole) return true

    const request = context.switchToHttp().getRequest<Request>()
    const user = request.user as CurrentUserPayload
    const rawOrgId = request.params['orgId'] as string
    const rawProjectId = request.params['projectId'] as string

    const resolvedOrgId = await this.resolveOrgId(rawOrgId)
    if (!resolvedOrgId) {
      throw new ForbiddenException('You do not have access to this project')
    }

    // Write back the resolved org ID so downstream controllers/handlers always receive
    // the actual numeric/ObjectId, not a slug
    request.params['orgId'] = resolvedOrgId

    const orgMember = await this.orgMemberRepository.findMembership(resolvedOrgId, user.id)
    if (!orgMember) {
      throw new ForbiddenException('You do not have access to this project')
    }

    // Always resolve the project and verify it belongs to this organisation
    const project = await this.resolveProject(resolvedOrgId, rawProjectId)
    if (!project) {
      throw new ForbiddenException('You do not have access to this project')
    }

    // Write back the resolved project ID so downstream handlers always receive the actual ID
    request.params['projectId'] = String(project.id)

    // Org owners and administrators have implicit full access to all projects in their org
    if (orgMember.role === OrganisationRole.OWNER || orgMember.role === OrganisationRole.ADMINISTRATOR) {
      return true
    }

    // Standard org members must have an explicit project membership that meets the required role
    const projectMember = await this.projectMemberRepository.findMembership(String(project.id), user.id)
    if (!projectMember) {
      throw new ForbiddenException('You do not have access to this project')
    }

    if (PROJECT_ROLE_RANK[projectMember.role] < PROJECT_ROLE_RANK[requiredRole]) {
      throw new ForbiddenException('Insufficient role for this action')
    }

    return true
  }

  private async resolveOrgId(identifier: string): Promise<string | null> {
    if (/^\d+$/.test(identifier) || /^[a-f0-9]{24}$/i.test(identifier)) {
      return identifier
    }
    const org = await this.orgRepository.findBySlug(identifier)
    if (!org) return null
    return String(org.id)
  }

  /**
   * Resolves a project identifier (ID or slug) to a Project entity, and verifies
   * that it belongs to the given organisation. Returns null if not found or if
   * the project belongs to a different organisation.
   */
  private async resolveProject(organisationId: string, identifier: string): Promise<Project | null> {
    let project: Project | null

    if (/^\d+$/.test(identifier) || /^[a-f0-9]{24}$/i.test(identifier)) {
      project = await this.projectRepository.findById(identifier)
    } else {
      project = await this.projectRepository.findBySlug(organisationId, identifier)
    }

    if (!project) return null
    if (String(project.organisationId) !== organisationId) return null

    return project
  }
}
