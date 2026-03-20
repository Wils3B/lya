import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'
import { CurrentUserPayload } from '../../auth/decorators/current-user.decorator'
import { REQUIRED_ORG_ROLE_KEY } from '../decorators/required-org-role.decorator'
import { OrganisationRole } from '../entities/organisation-member.entity'
import { OrganisationMemberRepository } from '../repositories/organisation-member.repository'
import { OrganisationRepository } from '../repositories/organisation.repository'

const ROLE_RANK: Record<OrganisationRole, number> = {
  [OrganisationRole.OWNER]: 3,
  [OrganisationRole.ADMINISTRATOR]: 2,
  [OrganisationRole.STANDARD]: 1,
}

@Injectable()
export class OrganisationRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly memberRepository: OrganisationMemberRepository,
    private readonly organisationRepository: OrganisationRepository
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRole = this.reflector.getAllAndOverride<OrganisationRole>(REQUIRED_ORG_ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRole) return true

    const request = context.switchToHttp().getRequest<Request>()
    const user = request.user as CurrentUserPayload
    const rawId = request.params['id'] as string

    // Resolve the identifier to a numeric/ObjectId string so membership lookup works
    const resolvedId = await this.resolveOrgId(rawId)
    if (!resolvedId) {
      throw new ForbiddenException('You are not a member of this organisation')
    }

    const member = await this.memberRepository.findMembership(resolvedId, user.id)
    if (!member) {
      throw new ForbiddenException('You are not a member of this organisation')
    }

    if (ROLE_RANK[member.role] < ROLE_RANK[requiredRole]) {
      throw new ForbiddenException('Insufficient role for this action')
    }

    return true
  }

  private async resolveOrgId(identifier: string): Promise<string | null> {
    // If it looks like a pure integer or MongoDB ObjectId hex, use it directly
    if (/^\d+$/.test(identifier) || /^[a-f0-9]{24}$/.test(identifier)) {
      return identifier
    }
    // Otherwise treat as slug and look up the actual org ID
    const org = await this.organisationRepository.findBySlug(identifier)
    if (!org) return null
    return String(org.id)
  }
}
