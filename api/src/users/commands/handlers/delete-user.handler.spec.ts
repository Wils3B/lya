import { User } from '../../entities/user.entity'
import { UserRepository } from '../../repositories/user.repository'
import { DeleteUserCommand } from '../delete-user.command'
import { DeleteUserHandler } from './delete-user.handler'

describe('DeleteUserHandler', () => {
  it('returns null when user does not exist', async () => {
    const findByIdMock = jest.fn().mockResolvedValue(null)
    const removeMock = jest.fn()
    const repo = {
      findById: findByIdMock,
      remove: removeMock,
    } as unknown as UserRepository

    const handler = new DeleteUserHandler(repo)
    const result = await handler.execute(new DeleteUserCommand('42'))

    expect(result).toBeNull()
    expect(removeMock).not.toHaveBeenCalled()
  })

  it('removes and returns existing user', async () => {
    const existing = { id: 1, name: 'Alice', email: 'alice@example.com' } as User
    const findByIdMock = jest.fn().mockResolvedValue(existing)
    const removeMock = jest.fn().mockResolvedValue(existing)
    const repo = {
      findById: findByIdMock,
      remove: removeMock,
    } as unknown as UserRepository

    const handler = new DeleteUserHandler(repo)
    const result = await handler.execute(new DeleteUserCommand('1'))

    expect(findByIdMock).toHaveBeenCalledWith('1')
    expect(removeMock).toHaveBeenCalledWith(existing)
    expect(result).toEqual(existing)
  })
})
