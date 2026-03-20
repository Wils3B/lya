import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, Matches } from 'class-validator'

export class UpdateOrganisationDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string

  @ApiPropertyOptional({ description: 'URL-safe slug (lowercase, letters, numbers, hyphens)' })
  @IsString()
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'slug must be lowercase, alphanumeric, with hyphens only' })
  slug?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string
}
