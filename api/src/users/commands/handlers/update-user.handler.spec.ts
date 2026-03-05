import { User } from '../../entities/user.entity'
import { UserRepository } from '../../repositories/user.repository'
import { UpdateUserCommand } from '../update-user.command'
import { UpdateUserHandler } from './update-user.handler'

describe('UpdateUserHandler', () => {
  it('returns null when user does not exist', async () => {
    const findByIdMock = jest.fn().mockResolvedValue(null)
    const mergeMock = jest.fn()
    const saveMock = jest.fn()
    const repo = {
      findById: findByIdMock,
      merge: mergeMock,
      save: saveMock,
    } as unknown as UserRepository

    const handler = new UpdateUserHandler(repo)
    const result = await handler.execute(new UpdateUserCommand('42', { name: 'Bob' }))

    expect(result).toBeNull()
    expect(mergeMock).not.toHaveBeenCalled()
  })

  it('updates and saves an existing user', async () => {
    const existing = { id: 1, name: 'Alice', email: 'alice@example.com' } as User
    const findByIdMock = jest.fn().mockResolvedValue(existing)
    const mergeMock = jest.fn()
    const saveMock = jest.fn().mockResolvedValue({ ...existing, name: 'Bob' })
    const repo = {
      findById: findByIdMock,
      merge: mergeMock,
      save: saveMock,
    } as unknown as UserRepository

    const handler = new UpdateUserHandler(repo)
    const result = await handler.execute(new UpdateUserCommand('1', { name: 'Bob' }))

    expect(findByIdMock).toHaveBeenCalledWith('1')
    expect(mergeMock).toHaveBeenCalledWith(existing, { name: 'Bob' })
    expect(saveMock).toHaveBeenCalledWith(existing)
    expect(result).toMatchObject({ name: 'Bob' })
  })
})
