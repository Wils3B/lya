import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class LoginDto {
  @ApiProperty({ description: 'Email address or username' })
  @IsString()
  @IsNotEmpty()
  identifier: string

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string
}
