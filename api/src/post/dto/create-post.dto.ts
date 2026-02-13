import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator'

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  content: string

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  published?: boolean
}

export class UpdatePostDto extends CreatePostDto {}
