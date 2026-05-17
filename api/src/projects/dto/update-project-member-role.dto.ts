import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'
import { ProjectRole } from '../entities/project-role.enum'

export class UpdateProjectMemberRoleDto {
  @IsEnum(ProjectRole)
  @ApiProperty({ enum: ProjectRole })
  role: ProjectRole
}
