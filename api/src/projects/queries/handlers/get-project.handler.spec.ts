import { Project } from '../../entities/project.entity'
import { ProjectRepository } from '../../repositories/project.repository'
import { GetProjectQuery } from '../get-project.query'
import { GetProjectHandler } from './get-project.handler'

describe('GetProjectHandler', () => {
  it('returns the project when found', async () => {
    const project = { id: 1, name: 'My App' } as Project
    const findById = jest.fn().mockResolvedValue(project)
    const repo = { findById } as unknown as ProjectRepository
    const handler = new GetProjectHandler(repo)

    const result = await handler.execute(new GetProjectQuery('1'))
    expect(findById).toHaveBeenCalledWith('1')
    expect(result).toBe(project)
  })

  it('returns null when project not found', async () => {
    const findById = jest.fn().mockResolvedValue(null)
    const repo = { findById } as unknown as ProjectRepository
    const handler = new GetProjectHandler(repo)

    const result = await handler.execute(new GetProjectQuery('999'))
    expect(result).toBeNull()
  })
})
