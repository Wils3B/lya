import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import * as bcrypt from 'bcrypt'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { User } from '../../users/entities/user.entity'
import { UserRepository } from '../../users/repositories/user.repository'

interface JwtRefreshPayload {
  sub: string
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly userRepository: UserRepository,
    configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('LYA_JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    })
  }

  async validate(req: Request, payload: JwtRefreshPayload): Promise<User> {
    const token = req.headers['authorization']?.split(' ')[1]
    if (!token) throw new UnauthorizedException()

    const user = await this.userRepository.findByIdWithSecrets(payload.sub)
    if (!user || !user.refreshTokenHash) throw new UnauthorizedException()

    const isValid = await bcrypt.compare(token, user.refreshTokenHash)
    if (!isValid) throw new UnauthorizedException()

    return user
  }
}
