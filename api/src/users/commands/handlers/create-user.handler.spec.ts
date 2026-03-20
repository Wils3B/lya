import { Repository } from 'typeorm'
import { User } from '../../entities/user.entity'
import { CreateUserCommand } from '../create-user.command'
import { CreateUserHandler } from './create-user.handler'

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}))

describe('CreateUserHandler', () => {
  it('hashes the password and saves the user', async () => {
    const createMock = jest.fn()
    const saveMock = jest.fn()
    const repo = {
      create: createMock,
      save: saveMock,
    } as unknown as Repository<User>

    const payload = { name: 'Alice', username: 'alice', email: 'alice@example.com', password: 'plaintext' }
    const userWithHashedPassword = {
      name: 'Alice',
      username: 'alice',
      email: 'alice@example.com',
      password: 'hashed-password',
    }
    const savedUser = { id: 1, ...userWithHashedPassword }

    createMock.mockReturnValue(userWithHashedPassword)
    saveMock.mockResolvedValue(savedUser)

    const handler = new CreateUserHandler(repo)
    const result = await handler.execute(new CreateUserCommand(payload))

    expect(createMock).toHaveBeenCalledWith(userWithHashedPassword)
    expect(createMock).not.toHaveBeenCalledWith(expect.objectContaining({ password: 'plaintext' }))
    expect(saveMock).toHaveBeenCalledWith(userWithHashedPassword)
    expect(result).toMatchObject({ id: 1, name: 'Alice', email: 'alice@example.com' })
  })
})
