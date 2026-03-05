import { Repository } from 'typeorm'
import { User } from '../../entities/user.entity'
import { GetUsersHandler } from './get-users.handler'

describe('GetUsersHandler', () => {
  it('returns all users', async () => {
    const users = [{ id: 1, name: 'Alice', email: 'alice@example.com' }] as User[]
    const findMock = jest.fn().mockResolvedValue(users)
    const repo = {
      find: findMock,
    } as unknown as Repository<User>

    const handler = new GetUsersHandler(repo)
    const result = await handler.execute()

    expect(findMock).toHaveBeenCalled()
    expect(result).toEqual(users)
  })
})
