import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LocalesModule } from '../locales/locales.module'
import { OrganisationsModule } from '../organisations/organisations.module'
import { CommandHandlers } from './commands/handlers'
import { ProjectLocale } from './entities/project-locale.entity'
import { ProjectMember } from './entities/project-member.entity'
import { Project } from './entities/project.entity'
import { ProjectRoleGuard } from './guards/project-role.guard'
import { ProjectsController } from './projects.controller'
import { QueryHandlers } from './queries/handlers'
import { ProjectLocaleRepository } from './repositories/project-locale.repository'
import { ProjectMemberRepository } from './repositories/project-member.repository'
import { ProjectRepository } from './repositories/project.repository'

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, ProjectLocale, ProjectMember]),
    CqrsModule,
    OrganisationsModule,
    LocalesModule,
  ],
  controllers: [ProjectsController],
  providers: [
    ProjectRepository,
    ProjectLocaleRepository,
    ProjectMemberRepository,
    ProjectRoleGuard,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class ProjectsModule {}
