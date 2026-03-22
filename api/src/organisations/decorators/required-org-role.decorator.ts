import { SetMetadata } from '@nestjs/common'
import { OrganisationRole } from '../entities/organisation-member.entity'

export const REQUIRED_ORG_ROLE_KEY = 'requiredOrgRole'
export const RequiredOrgRole = (role: OrganisationRole) => SetMetadata(REQUIRED_ORG_ROLE_KEY, role)
