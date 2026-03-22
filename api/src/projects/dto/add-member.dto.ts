import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ProjectRole } from '../entities/project-role.enum'

export class AddMemberDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  userId: string

  @IsEnum(ProjectRole)
  @IsOptional()
  @ApiPropertyOptional({ enum: ProjectRole, default: ProjectRole.CONTRIBUTOR })
  role?: ProjectRole
}
