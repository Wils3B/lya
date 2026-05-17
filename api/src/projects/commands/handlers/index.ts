import { AddLocaleHandler } from './add-locale.handler'
import { AddMemberHandler } from './add-member.handler'
import { CreateProjectHandler } from './create-project.handler'
import { DeleteProjectHandler } from './delete-project.handler'
import { RemoveLocaleHandler } from './remove-locale.handler'
import { RemoveMemberHandler } from './remove-member.handler'
import { UpdateMemberRoleHandler } from './update-member-role.handler'
import { UpdateProjectHandler } from './update-project.handler'

export const CommandHandlers = [
  CreateProjectHandler,
  UpdateProjectHandler,
  DeleteProjectHandler,
  AddLocaleHandler,
  RemoveLocaleHandler,
  AddMemberHandler,
  RemoveMemberHandler,
  UpdateMemberRoleHandler,
]
