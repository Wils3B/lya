import { ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { OrganisationRole } from '../../organisations/entities/organisation-member.entity'
import { OrganisationMemberRepository } from '../../organisations/repositories/organisation-member.repository'
import { OrganisationRepository } from '../../organisations/repositories/organisation.repository'
import { ProjectRole } from '../entities/project-role.enum'
import { Project } from '../entities/project.entity'
import { ProjectMemberRepository } from '../repositories/project-member.repository'
import { ProjectRepository } from '../repositories/project.repository'
import { ProjectRoleGuard } from './project-role.guard'

const USER = { id: '42', email: 'user@example.com' }

function makeContext(params: Record<string, string>): ExecutionContext {
  const request = { params: { ...params }, user: USER }
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({ getRequest: jest.fn().mockReturnValue(request) }),
  } as unknown as ExecutionContext
}

function makeGuard(
  overrides: {
    requiredRole?: ProjectRole | null
    orgRepo?: Partial<OrganisationRepository>
    orgMemberRepo?: Partial<OrganisationMemberRepository>
    projectRepo?: Partial<ProjectRepository>
    projectMemberRepo?: Partial<ProjectMemberRepository>
  } = {}
) {
  const resolvedRole = overrides.requiredRole === undefined ? ProjectRole.CONTRIBUTOR : overrides.requiredRole
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(resolvedRole),
  } as unknown as Reflector

  const orgRepo = {
    findBySlug: jest.fn().mockResolvedValue(null),
    ...overrides.orgRepo,
  } as unknown as OrganisationRepository

  const orgMemberRepo = {
    findMembership: jest.fn().mockResolvedValue({ role: OrganisationRole.STANDARD }),
    ...overrides.orgMemberRepo,
  } as unknown as OrganisationMemberRepository

  const projectRepo = {
    findById: jest.fn().mockResolvedValue(null),
    findBySlug: jest.fn().mockResolvedValue(null),
    ...overrides.projectRepo,
  } as unknown as ProjectRepository

  const projectMemberRepo = {
    findMembership: jest.fn().mockResolvedValue(null),
    ...overrides.projectMemberRepo,
  } as unknown as ProjectMemberRepository

  const guard = new ProjectRoleGuard(reflector, orgMemberRepo, orgRepo, projectMemberRepo, projectRepo)
  return { guard, reflector, orgRepo, orgMemberRepo, projectRepo, projectMemberRepo }
}

const PROJECT = { id: 5, organisationId: 10 } as unknown as Project

describe('ProjectRoleGuard', () => {
  it('passes through when no role is required', async () => {
    const { guard } = makeGuard({ requiredRole: null })
    const ctx = makeContext({ orgId: '10', projectId: '5' })
    await expect(guard.canActivate(ctx)).resolves.toBe(true)
  })

  it('throws ForbiddenException when org slug cannot be resolved', async () => {
    const { guard } = makeGuard({ orgRepo: { findBySlug: jest.fn().mockResolvedValue(null) } })
    const ctx = makeContext({ orgId: 'unknown-org', projectId: '5' })
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException)
  })

  it('throws ForbiddenException when user has no org membership', async () => {
    const { guard } = makeGuard({ orgMemberRepo: { findMembership: jest.fn().mockResolvedValue(null) } })
    const ctx = makeContext({ orgId: '10', projectId: '5' })
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException)
  })

  it('throws NotFoundException when org admin requests a non-existent project', async () => {
    const { guard } = makeGuard({
      orgMemberRepo: { findMembership: jest.fn().mockResolvedValue({ role: OrganisationRole.OWNER }) },
      projectRepo: { findById: jest.fn().mockResolvedValue(null) },
    })
    const ctx = makeContext({ orgId: '10', projectId: '9999' })
    await expect(guard.canActivate(ctx)).rejects.toThrow(NotFoundException)
  })

  it('throws ForbiddenException (not 404) when standard member requests a non-existent project', async () => {
    const { guard } = makeGuard({
      projectRepo: { findById: jest.fn().mockResolvedValue(null) },
    })
    const ctx = makeContext({ orgId: '10', projectId: '9999' })
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException)
  })

  it('throws ForbiddenException when project belongs to a different organisation (cross-org)', async () => {
    const { guard } = makeGuard({
      projectRepo: { findById: jest.fn().mockResolvedValue({ id: 5, organisationId: 99 } as unknown as Project) },
    })
    const ctx = makeContext({ orgId: '10', projectId: '5' })
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException)
  })

  it('throws ForbiddenException when project slug is not found in org', async () => {
    const { guard } = makeGuard({
      projectRepo: { findById: jest.fn().mockResolvedValue(null), findBySlug: jest.fn().mockResolvedValue(null) },
    })
    const ctx = makeContext({ orgId: '10', projectId: 'my-app' })
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException)
  })

  it('resolves org slug and project slug to ids and writes them back to request params', async () => {
    const org = { id: 10 }
    const { guard } = makeGuard({
      orgRepo: { findBySlug: jest.fn().mockResolvedValue(org) },
      orgMemberRepo: { findMembership: jest.fn().mockResolvedValue({ role: OrganisationRole.OWNER }) },
      projectRepo: {
        findById: jest.fn().mockResolvedValue(null),
        findBySlug: jest.fn().mockResolvedValue(PROJECT),
      },
    })
    const ctx = makeContext({ orgId: 'my-org', projectId: 'my-app' })
    await guard.canActivate(ctx)
    const request = ctx.switchToHttp().getRequest()
    expect(request.params.orgId).toBe('10')
    expect(request.params.projectId).toBe('5')
  })

  it('grants access to org OWNER without checking project membership', async () => {
    const findProjectMembership = jest.fn().mockResolvedValue(null)
    const { guard } = makeGuard({
      orgMemberRepo: { findMembership: jest.fn().mockResolvedValue({ role: OrganisationRole.OWNER }) },
      projectRepo: { findById: jest.fn().mockResolvedValue(PROJECT) },
      projectMemberRepo: { findMembership: findProjectMembership },
    })
    const ctx = makeContext({ orgId: '10', projectId: '5' })
    await expect(guard.canActivate(ctx)).resolves.toBe(true)
    expect(findProjectMembership).not.toHaveBeenCalled()
  })

  it('grants access to org ADMINISTRATOR without checking project membership', async () => {
    const findProjectMembership = jest.fn().mockResolvedValue(null)
    const { guard } = makeGuard({
      orgMemberRepo: { findMembership: jest.fn().mockResolvedValue({ role: OrganisationRole.ADMINISTRATOR }) },
      projectRepo: { findById: jest.fn().mockResolvedValue(PROJECT) },
      projectMemberRepo: { findMembership: findProjectMembership },
    })
    const ctx = makeContext({ orgId: '10', projectId: '5' })
    await expect(guard.canActivate(ctx)).resolves.toBe(true)
    expect(findProjectMembership).not.toHaveBeenCalled()
  })

  it('throws ForbiddenException when standard member has no project membership', async () => {
    const { guard } = makeGuard({
      projectRepo: { findById: jest.fn().mockResolvedValue(PROJECT) },
      projectMemberRepo: { findMembership: jest.fn().mockResolvedValue(null) },
    })
    const ctx = makeContext({ orgId: '10', projectId: '5' })
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException)
  })

  it('throws ForbiddenException when standard member role is below required', async () => {
    const { guard } = makeGuard({
      requiredRole: ProjectRole.MAINTAINER,
      projectRepo: { findById: jest.fn().mockResolvedValue(PROJECT) },
      projectMemberRepo: { findMembership: jest.fn().mockResolvedValue({ role: ProjectRole.CONTRIBUTOR }) },
    })
    const ctx = makeContext({ orgId: '10', projectId: '5' })
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException)
  })

  it('grants access when standard member role meets required', async () => {
    const { guard } = makeGuard({
      requiredRole: ProjectRole.CONTRIBUTOR,
      projectRepo: { findById: jest.fn().mockResolvedValue(PROJECT) },
      projectMemberRepo: { findMembership: jest.fn().mockResolvedValue({ role: ProjectRole.CONTRIBUTOR }) },
    })
    const ctx = makeContext({ orgId: '10', projectId: '5' })
    await expect(guard.canActivate(ctx)).resolves.toBe(true)
  })

  it('grants access when standard member is MAINTAINER and CONTRIBUTOR is required', async () => {
    const { guard } = makeGuard({
      requiredRole: ProjectRole.CONTRIBUTOR,
      projectRepo: { findById: jest.fn().mockResolvedValue(PROJECT) },
      projectMemberRepo: { findMembership: jest.fn().mockResolvedValue({ role: ProjectRole.MAINTAINER }) },
    })
    const ctx = makeContext({ orgId: '10', projectId: '5' })
    await expect(guard.canActivate(ctx)).resolves.toBe(true)
  })
})
