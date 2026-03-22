import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class UpdateOrganisationDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string

  @ApiPropertyOptional({ description: 'URL slug (lowercase letters, numbers and hyphens)' })
  @IsString()
  @IsOptional()
  @Matches(/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/, {
    message: 'slug must contain only lowercase letters, numbers and hyphens',
  })
  @MinLength(3)
  @MaxLength(25)
  slug?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string
}
