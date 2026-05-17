import { SetMetadata } from '@nestjs/common'
import { ProjectRole } from '../entities/project-role.enum'

export const REQUIRED_PROJECT_ROLE_KEY = 'required_project_role'
export const RequiredProjectRole = (role: ProjectRole) => SetMetadata(REQUIRED_PROJECT_ROLE_KEY, role)
