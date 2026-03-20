import { User } from '../users/entities/user.entity'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AuthTokensDto } from './dto/auth-tokens.dto'
import { LoginDto } from './dto/login.dto'

describe('AuthController', () => {
  let controller: AuthController
  let authService: jest.Mocked<Pick<AuthService, 'login' | 'refresh'>>

  const tokens: AuthTokensDto = { accessToken: 'access', refreshToken: 'refresh' }

  beforeEach(() => {
    authService = {
      login: jest.fn().mockResolvedValue(tokens),
      refresh: jest.fn().mockResolvedValue(tokens),
    }
    controller = new AuthController(authService as unknown as AuthService)
  })

  describe('login', () => {
    it('delegates to authService.login and returns tokens', async () => {
      const dto: LoginDto = { identifier: 'alice@example.com', password: 'password123' }
      const result = await controller.login(dto)
      expect(authService.login).toHaveBeenCalledWith(dto)
      expect(result).toEqual(tokens)
    })
  })

  describe('refresh', () => {
    it('delegates to authService.refresh with req.user and returns tokens', async () => {
      const user = { id: 1, email: 'alice@example.com' } as User
      const req = { user } as Express.Request
      const result = await controller.refresh(req as never)
      expect(authService.refresh).toHaveBeenCalledWith(user)
      expect(result).toEqual(tokens)
    })
  })
})
