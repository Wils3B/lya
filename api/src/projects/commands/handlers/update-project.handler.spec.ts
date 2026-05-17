import { ConflictException } from '@nestjs/common'
import { Project } from '../../entities/project.entity'
import { ProjectRepository } from '../../repositories/project.repository'
import { UpdateProjectCommand } from '../update-project.command'
import { UpdateProjectHandler } from './update-project.handler'

describe('UpdateProjectHandler', () => {
  const existing = { id: 1, organisationId: 10, name: 'Old', slug: 'old', description: null } as Project

  function makeRepo(overrides: Partial<{ findById: jest.Mock; findBySlug: jest.Mock }> = {}) {
    const findById = overrides.findById ?? jest.fn().mockResolvedValue(existing)
    const findBySlug = overrides.findBySlug ?? jest.fn().mockResolvedValue(null)
    const save = jest.fn().mockImplementation((p) => Promise.resolve(p))
    const repo = { findById, findBySlug, save } as unknown as ProjectRepository
    return { repo, findById, findBySlug, save }
  }

  it('returns null when project does not exist', async () => {
    const { repo } = makeRepo({ findById: jest.fn().mockResolvedValue(null) })
    const handler = new UpdateProjectHandler(repo)
    const result = await handler.execute(new UpdateProjectCommand('1', '10', { name: 'New' }))
    expect(result).toBeNull()
  })

  it('updates name and saves', async () => {
    const { repo, save } = makeRepo()
    const handler = new UpdateProjectHandler(repo)
    const result = await handler.execute(new UpdateProjectCommand('1', '10', { name: 'New Name' }))
    expect(result?.name).toBe('New Name')
    expect(save).toHaveBeenCalled()
  })

  it('throws ConflictException when new slug conflicts with another project', async () => {
    const conflicting = { id: 99, slug: 'new-slug' } as Project
    const { repo } = makeRepo({ findBySlug: jest.fn().mockResolvedValue(conflicting) })
    const handler = new UpdateProjectHandler(repo)

    await expect(handler.execute(new UpdateProjectCommand('1', '10', { slug: 'new-slug' }))).rejects.toThrow(
      ConflictException
    )
  })

  it('allows updating to the same slug (no conflict check needed)', async () => {
    const { repo, findBySlug } = makeRepo()
    const handler = new UpdateProjectHandler(repo)
    // slug unchanged → findBySlug not called for conflict
    const result = await handler.execute(new UpdateProjectCommand('1', '10', { slug: 'old' }))
    expect(findBySlug).not.toHaveBeenCalled()
    expect(result?.slug).toBe('old')
  })
})
