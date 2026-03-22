import { Provider } from '@nestjs/common'
import { GetOrganisationHandler } from './get-organisation.handler'
import { ListOrganisationMembersHandler } from './list-organisation-members.handler'
import { ListUserOrganisationsHandler } from './list-user-organisations.handler'

export const QueryHandlers: Provider[] = [
  GetOrganisationHandler,
  ListOrganisationMembersHandler,
  ListUserOrganisationsHandler,
]
