import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { OrganisationRole } from '../entities/organisation-member.entity'

export class InviteMemberDto {
  @ApiProperty({ description: 'ID of the user to invite' })
  @IsString()
  @IsNotEmpty()
  userId: string

  @ApiPropertyOptional({ enum: OrganisationRole, default: OrganisationRole.STANDARD })
  @IsEnum(OrganisationRole)
  @IsOptional()
  role?: OrganisationRole
}
