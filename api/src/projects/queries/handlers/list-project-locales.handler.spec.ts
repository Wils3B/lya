import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto'
import { ProjectLocale } from '../../entities/project-locale.entity'
import { ProjectLocaleRepository } from '../../repositories/project-locale.repository'
import { ListProjectLocalesQuery } from '../list-project-locales.query'
import { ListProjectLocalesHandler } from './list-project-locales.handler'

describe('ListProjectLocalesHandler', () => {
  it('delegates to repository and returns paginated result', async () => {
    const paginated = new PaginatedResponseDto<ProjectLocale>([], 0, 1, 20)
    const findPaginated = jest.fn().mockResolvedValue(paginated)
    const repo = { findPaginatedByProjectId: findPaginated } as unknown as ProjectLocaleRepository

    const handler = new ListProjectLocalesHandler(repo)
    const result = await handler.execute(new ListProjectLocalesQuery('1', 1, 20))

    expect(findPaginated).toHaveBeenCalledWith('1', 1, 20)
    expect(result).toBe(paginated)
  })
})
