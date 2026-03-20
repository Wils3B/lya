import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsNotEmpty } from 'class-validator'
import { OrganisationRole } from '../entities/organisation-member.entity'

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: [OrganisationRole.ADMINISTRATOR, OrganisationRole.STANDARD] })
  @IsIn([OrganisationRole.ADMINISTRATOR, OrganisationRole.STANDARD], {
    message: 'role must be administrator or standard',
  })
  @IsNotEmpty()
  role: OrganisationRole.ADMINISTRATOR | OrganisationRole.STANDARD
}
