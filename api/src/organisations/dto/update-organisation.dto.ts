import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, Matches } from 'class-validator'

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
  slug?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string
}
