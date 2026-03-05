import { Repository } from 'typeorm'
import { User } from '../../entities/user.entity'
import { CreateUserCommand } from '../create-user.command'
import { CreateUserHandler } from './create-user.handler'

describe('CreateUserHandler', () => {
  it('creates and saves a user', async () => {
    const createMock = jest.fn()
    const saveMock = jest.fn()
    const repo = {
      create: createMock,
      save: saveMock,
    } as unknown as Repository<User>

    const payload = { name: 'Alice', email: 'alice@example.com' }
    const user = payload as User
    createMock.mockReturnValue(user)
    saveMock.mockResolvedValue({ id: 1, ...payload })

    const handler = new CreateUserHandler(repo)
    const result = await handler.execute(new CreateUserCommand(payload))

    expect(createMock).toHaveBeenCalledWith(payload)
    expect(saveMock).toHaveBeenCalledWith(user)
    expect(result).toMatchObject({ id: 1, ...payload })
  })
})
