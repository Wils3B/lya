import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { User } from '../users/entities/user.entity'
import { UserRepository } from '../users/repositories/user.repository'
import { AuthTokensDto } from './dto/auth-tokens.dto'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async login(loginDto: LoginDto): Promise<AuthTokensDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password)
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }
    return this.issueTokens(user)
  }

  async refresh(user: User): Promise<AuthTokensDto> {
    return this.issueTokens(user)
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email)
    if (!user?.password) return null
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) return null
    return user
  }

  private async issueTokens(user: User): Promise<AuthTokensDto> {
    const sub = String(user.id)

    const accessToken = this.jwtService.sign(
      { sub, email: user.email },
      {
        secret: this.configService.getOrThrow<string>('LYA_JWT_SECRET'),
        expiresIn: this.configService.get('LYA_JWT_EXPIRY', '15m'), // ms StringValue not directly importable as transitive dep
      }
    )

    const refreshToken = this.jwtService.sign(
      { sub },
      {
        secret: this.configService.getOrThrow<string>('LYA_JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('LYA_JWT_REFRESH_EXPIRY', '7d'),
      }
    )

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10)
    await this.userRepository.updateRefreshTokenHash(user.id, refreshTokenHash)

    return { accessToken, refreshToken }
  }
}
