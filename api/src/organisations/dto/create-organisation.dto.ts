import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator'

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
  slug: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string
}
