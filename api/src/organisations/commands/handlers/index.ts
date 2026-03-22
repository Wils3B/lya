import { Provider } from '@nestjs/common'
import { CreateOrganisationHandler } from './create-organisation.handler'
import { DeleteOrganisationHandler } from './delete-organisation.handler'
import { InviteMemberHandler } from './invite-member.handler'
import { LeaveOrganisationHandler } from './leave-organisation.handler'
import { RemoveMemberHandler } from './remove-member.handler'
import { TransferOwnershipHandler } from './transfer-ownership.handler'
import { UpdateMemberRoleHandler } from './update-member-role.handler'
import { UpdateOrganisationHandler } from './update-organisation.handler'

export const CommandHandlers: Provider[] = [
  CreateOrganisationHandler,
  DeleteOrganisationHandler,
  InviteMemberHandler,
  LeaveOrganisationHandler,
  RemoveMemberHandler,
  TransferOwnershipHandler,
  UpdateMemberRoleHandler,
  UpdateOrganisationHandler,
]
