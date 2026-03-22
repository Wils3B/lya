import { Project } from '../../entities/project.entity'
import { ProjectRepository } from '../../repositories/project.repository'
import { GetProjectBySlugQuery } from '../get-project-by-slug.query'
import { GetProjectBySlugHandler } from './get-project-by-slug.handler'

describe('GetProjectBySlugHandler', () => {
  it('returns the project when found by slug', async () => {
    const project = { id: 1, slug: 'my-app' } as Project
    const findBySlug = jest.fn().mockResolvedValue(project)
    const repo = { findBySlug } as unknown as ProjectRepository
    const handler = new GetProjectBySlugHandler(repo)

    const result = await handler.execute(new GetProjectBySlugQuery('10', 'my-app'))
    expect(findBySlug).toHaveBeenCalledWith('10', 'my-app')
    expect(result).toBe(project)
  })

  it('returns null when not found', async () => {
    const findBySlug = jest.fn().mockResolvedValue(null)
    const repo = { findBySlug } as unknown as ProjectRepository
    const handler = new GetProjectBySlugHandler(repo)

    const result = await handler.execute(new GetProjectBySlugQuery('10', 'nope'))
    expect(result).toBeNull()
  })
})
