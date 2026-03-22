import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto'
import { PaginationQueryDto } from '../common/dto/pagination-query.dto'
import { RequiredOrgRole } from '../organisations/decorators/required-org-role.decorator'
import { OrganisationRole } from '../organisations/entities/organisation-member.entity'
import { OrganisationRoleGuard } from '../organisations/guards/organisation-role.guard'
import {
  AddLocaleCommand,
  AddMemberCommand,
  CreateProjectCommand,
  DeleteProjectCommand,
  RemoveLocaleCommand,
  RemoveMemberCommand,
  UpdateMemberRoleCommand,
  UpdateProjectCommand,
} from './commands'
import { RequiredProjectRole } from './decorators/required-project-role.decorator'
import { AddLocaleDto } from './dto/add-locale.dto'
import { AddMemberDto } from './dto/add-member.dto'
import { CreateProjectDto } from './dto/create-project.dto'
import { UpdateProjectMemberRoleDto } from './dto/update-project-member-role.dto'
import { UpdateProjectDto } from './dto/update-project.dto'
import { ProjectLocale } from './entities/project-locale.entity'
import { ProjectMember } from './entities/project-member.entity'
import { ProjectRole } from './entities/project-role.enum'
import { Project } from './entities/project.entity'
import { ProjectRoleGuard } from './guards/project-role.guard'
import { GetProjectQuery, ListProjectLocalesQuery, ListProjectMembersQuery, ListProjectsQuery } from './queries'

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('projects')
@Controller('organisations/:orgId/projects')
export class ProjectsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @ApiOperation({ summary: 'Create a new project in the organisation' })
  @UseGuards(OrganisationRoleGuard)
  @RequiredOrgRole(OrganisationRole.STANDARD)
  @Post()
  create(
    @Param('orgId') orgId: string,
    @Body() dto: CreateProjectDto,
    @CurrentUser() user: CurrentUserPayload
  ): Promise<Project> {
    return this.commandBus.execute<Project>(new CreateProjectCommand(orgId, dto, user.id))
  }

  @ApiOperation({ summary: 'List projects in the organisation visible to the current user' })
  @UseGuards(OrganisationRoleGuard)
  @RequiredOrgRole(OrganisationRole.STANDARD)
  @Get()
  listProjects(
    @Param('orgId') orgId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Query() pagination: PaginationQueryDto
  ): Promise<PaginatedResponseDto<Project>> {
    return this.queryBus.execute<PaginatedResponseDto<Project>>(
      new ListProjectsQuery(orgId, user.id, pagination.page, pagination.limit)
    )
  }

  @ApiOperation({ summary: 'Get a project by ID or slug' })
  @UseGuards(ProjectRoleGuard)
  @RequiredProjectRole(ProjectRole.CONTRIBUTOR)
  @Get(':projectId')
  async findOne(@Param('projectId') projectId: string): Promise<Project> {
    const project = await this.queryBus.execute<Project | null>(new GetProjectQuery(projectId))
    if (!project) throw new NotFoundException(`Project ${projectId} not found`)
    return project
  }

  @ApiOperation({ summary: 'Update a project' })
  @UseGuards(ProjectRoleGuard)
  @RequiredProjectRole(ProjectRole.MAINTAINER)
  @Patch(':projectId')
  async update(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Body() dto: UpdateProjectDto
  ): Promise<Project> {
    const project = await this.commandBus.execute<Project | null>(new UpdateProjectCommand(projectId, orgId, dto))
    if (!project) throw new NotFoundException(`Project ${projectId} not found`)
    return project
  }

  @ApiOperation({ summary: 'Delete a project' })
  @UseGuards(OrganisationRoleGuard)
  @RequiredOrgRole(OrganisationRole.ADMINISTRATOR)
  @Delete(':projectId')
  async remove(@Param('orgId') orgId: string, @Param('projectId') projectId: string): Promise<Project> {
    const project = await this.commandBus.execute<Project | null>(new DeleteProjectCommand(projectId, orgId))
    if (!project) throw new NotFoundException(`Project ${projectId} not found`)
    return project
  }

  // ─── Locales ─────────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'List locales of a project' })
  @UseGuards(ProjectRoleGuard)
  @RequiredProjectRole(ProjectRole.CONTRIBUTOR)
  @Get(':projectId/locales')
  listLocales(
    @Param('projectId') projectId: string,
    @Query() pagination: PaginationQueryDto
  ): Promise<PaginatedResponseDto<ProjectLocale>> {
    return this.queryBus.execute<PaginatedResponseDto<ProjectLocale>>(
      new ListProjectLocalesQuery(projectId, pagination.page, pagination.limit)
    )
  }

  @ApiOperation({ summary: 'Add a locale to the project' })
  @UseGuards(ProjectRoleGuard)
  @RequiredProjectRole(ProjectRole.MAINTAINER)
  @Post(':projectId/locales')
  addLocale(@Param('projectId') projectId: string, @Body() dto: AddLocaleDto): Promise<ProjectLocale> {
    return this.commandBus.execute<ProjectLocale>(new AddLocaleCommand(projectId, dto.localeCode))
  }

  @ApiOperation({ summary: 'Remove a locale from the project' })
  @UseGuards(ProjectRoleGuard)
  @RequiredProjectRole(ProjectRole.MAINTAINER)
  @Delete(':projectId/locales/:localeCode')
  async removeLocale(
    @Param('projectId') projectId: string,
    @Param('localeCode') localeCode: string
  ): Promise<ProjectLocale> {
    const locale = await this.commandBus.execute<ProjectLocale | null>(new RemoveLocaleCommand(projectId, localeCode))
    if (!locale) throw new NotFoundException(`Locale '${localeCode}' is not set on this project`)
    return locale
  }

  // ─── Members ─────────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'List members of a project' })
  @UseGuards(ProjectRoleGuard)
  @RequiredProjectRole(ProjectRole.CONTRIBUTOR)
  @Get(':projectId/members')
  listMembers(
    @Param('projectId') projectId: string,
    @Query() pagination: PaginationQueryDto
  ): Promise<PaginatedResponseDto<ProjectMember>> {
    return this.queryBus.execute<PaginatedResponseDto<ProjectMember>>(
      new ListProjectMembersQuery(projectId, pagination.page, pagination.limit)
    )
  }

  @ApiOperation({ summary: 'Add a member to the project' })
  @UseGuards(ProjectRoleGuard)
  @RequiredProjectRole(ProjectRole.MAINTAINER)
  @Post(':projectId/members')
  addMember(@Param('projectId') projectId: string, @Body() dto: AddMemberDto): Promise<ProjectMember> {
    return this.commandBus.execute<ProjectMember>(
      new AddMemberCommand(projectId, dto.userId, dto.role ?? ProjectRole.CONTRIBUTOR)
    )
  }

  @ApiOperation({ summary: 'Remove a member from the project' })
  @UseGuards(ProjectRoleGuard)
  @RequiredProjectRole(ProjectRole.MAINTAINER)
  @Delete(':projectId/members/:userId')
  async removeMember(@Param('projectId') projectId: string, @Param('userId') userId: string): Promise<ProjectMember> {
    const member = await this.commandBus.execute<ProjectMember | null>(new RemoveMemberCommand(projectId, userId))
    if (!member) throw new NotFoundException(`User ${userId} is not a member of this project`)
    return member
  }

  @ApiOperation({ summary: 'Update the role of a project member' })
  @UseGuards(ProjectRoleGuard)
  @RequiredProjectRole(ProjectRole.MAINTAINER)
  @Patch(':projectId/members/:userId/role')
  async updateMemberRole(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateProjectMemberRoleDto
  ): Promise<ProjectMember> {
    const member = await this.commandBus.execute<ProjectMember | null>(
      new UpdateMemberRoleCommand(projectId, userId, dto.role)
    )
    if (!member) throw new NotFoundException(`User ${userId} is not a member of this project`)
    return member
  }
}
