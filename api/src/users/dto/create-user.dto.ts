import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator'

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ description: 'Alphanumeric with hyphens/underscores, 3-30 characters' })
  @Matches(/^[a-zA-Z0-9_-]{3,30}$/, {
    message: 'username must be 3-30 characters and contain only letters, numbers, hyphens, or underscores',
  })
  username: string

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({ writeOnly: true, minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string
}
