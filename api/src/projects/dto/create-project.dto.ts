import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, {
    message: 'slug must be lowercase alphanumeric and hyphens, start and end with alphanumeric',
  })
  @ApiProperty({ description: 'Unique slug within the organisation (lowercase, alphanumeric, hyphens)' })
  slug: string

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  description?: string
}
