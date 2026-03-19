import { UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { User } from '../users/entities/user.entity'
import { UserRepository } from '../users/repositories/user.repository'
import { AuthService } from './auth.service'

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}))

const mockUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 1,
    email: 'alice@example.com',
    name: 'Alice',
    password: 'hashed',
    refreshTokenHash: null,
    ...overrides,
  }) as User

describe('AuthService', () => {
  let service: AuthService
  let userRepository: jest.Mocked<Pick<UserRepository, 'findByEmail' | 'updateRefreshTokenHash'>>
  let jwtService: jest.Mocked<Pick<JwtService, 'sign'>>
  let configService: jest.Mocked<Pick<ConfigService, 'get' | 'getOrThrow'>>

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      updateRefreshTokenHash: jest.fn().mockResolvedValue(undefined),
    }
    jwtService = {
      sign: jest.fn().mockReturnValue('signed-token'),
    }
    configService = {
      get: jest.fn().mockReturnValue('secret'),
      getOrThrow: jest.fn().mockReturnValue('secret'),
    }

    service = new AuthService(
      userRepository as unknown as UserRepository,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService
    )
  })

  describe('validateUser', () => {
    it('returns user when credentials are valid', async () => {
      const user = mockUser()
      userRepository.findByEmail.mockResolvedValue(user)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const result = await service.validateUser('alice@example.com', 'password123')
      expect(result).toBe(user)
    })

    it('returns null when user not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null)
      const result = await service.validateUser('nobody@example.com', 'password123')
      expect(result).toBeNull()
    })

    it('returns null when password is invalid', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser())
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      const result = await service.validateUser('alice@example.com', 'wrongpassword')
      expect(result).toBeNull()
    })

    it('returns null when user has no password', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser({ password: undefined }))
      const result = await service.validateUser('alice@example.com', 'password123')
      expect(result).toBeNull()
    })
  })

  describe('login', () => {
    it('returns tokens on valid credentials', async () => {
      const user = mockUser()
      userRepository.findByEmail.mockResolvedValue(user)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed-refresh-token')

      const result = await service.login({ email: 'alice@example.com', password: 'password123' })

      expect(result.accessToken).toBeDefined()
      expect(result.refreshToken).toBeDefined()
      expect(userRepository.updateRefreshTokenHash).toHaveBeenCalledWith(user.id, 'hashed-refresh-token')
    })

    it('throws UnauthorizedException on invalid credentials', async () => {
      userRepository.findByEmail.mockResolvedValue(null)

      await expect(service.login({ email: 'nobody@example.com', password: 'pass' })).rejects.toThrow(
        UnauthorizedException
      )
    })
  })

  describe('refresh', () => {
    it('issues new tokens for a valid user', async () => {
      const user = mockUser()
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-refresh-token')

      const result = await service.refresh(user)

      expect(result.accessToken).toBeDefined()
      expect(result.refreshToken).toBeDefined()
      expect(userRepository.updateRefreshTokenHash).toHaveBeenCalledWith(user.id, 'new-hashed-refresh-token')
    })
  })
})
