import { GetProjectBySlugHandler } from './get-project-by-slug.handler'
import { GetProjectHandler } from './get-project.handler'
import { ListProjectLocalesHandler } from './list-project-locales.handler'
import { ListProjectMembersHandler } from './list-project-members.handler'
import { ListProjectsHandler } from './list-projects.handler'

export const QueryHandlers = [
  GetProjectHandler,
  GetProjectBySlugHandler,
  ListProjectsHandler,
  ListProjectLocalesHandler,
  ListProjectMembersHandler,
]
