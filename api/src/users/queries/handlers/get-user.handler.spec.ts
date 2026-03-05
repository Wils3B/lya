import { User } from '../../entities/user.entity'
import { UserRepository } from '../../repositories/user.repository'
import { GetUserQuery } from '../get-user.query'
import { GetUserHandler } from './get-user.handler'

describe('GetUserHandler', () => {
  it('returns null when user does not exist', async () => {
    const findByIdMock = jest.fn().mockResolvedValue(null)
    const repo = {
      findById: findByIdMock,
    } as unknown as UserRepository

    const handler = new GetUserHandler(repo)
    const result = await handler.execute(new GetUserQuery('42'))

    expect(findByIdMock).toHaveBeenCalledWith('42')
    expect(result).toBeNull()
  })

  it('returns user when found', async () => {
    const user = { id: 1, name: 'Alice', email: 'alice@example.com' } as User
    const findByIdMock = jest.fn().mockResolvedValue(user)
    const repo = {
      findById: findByIdMock,
    } as unknown as UserRepository

    const handler = new GetUserHandler(repo)
    const result = await handler.execute(new GetUserQuery('1'))

    expect(findByIdMock).toHaveBeenCalledWith('1')
    expect(result).toEqual(user)
  })
})
