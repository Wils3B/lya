import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class CreateOrganisationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ description: 'URL slug (lowercase letters, numbers and hyphens)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/, {
    message: 'slug must contain only lowercase letters, numbers and hyphens',
  })
  @MinLength(3)
  @MaxLength(25)
  slug: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string
}
