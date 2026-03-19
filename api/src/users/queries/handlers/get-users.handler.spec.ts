import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto'
import { User } from '../../entities/user.entity'
import { UserRepository } from '../../repositories/user.repository'
import { GetUsersQuery } from '../get-users.query'
import { GetUsersHandler } from './get-users.handler'

describe('GetUsersHandler', () => {
  it('returns paginated users', async () => {
    const users = [{ id: 1, name: 'Alice', email: 'alice@example.com' }] as User[]
    const paginated = new PaginatedResponseDto(users, 1, 1, 20)
    const findPaginatedMock = jest.fn().mockResolvedValue(paginated)
    const repo = { findPaginated: findPaginatedMock } as unknown as UserRepository

    const handler = new GetUsersHandler(repo)
    const result = await handler.execute(new GetUsersQuery(1, 20))

    expect(findPaginatedMock).toHaveBeenCalledWith(1, 20)
    expect(result).toEqual(paginated)
  })
})
