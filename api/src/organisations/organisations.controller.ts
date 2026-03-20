import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto'
import { PaginationQueryDto } from '../common/dto/pagination-query.dto'
import {
  CreateOrganisationCommand,
  DeleteOrganisationCommand,
  InviteMemberCommand,
  LeaveOrganisationCommand,
  RemoveMemberCommand,
  TransferOwnershipCommand,
  UpdateMemberRoleCommand,
  UpdateOrganisationCommand,
} from './commands'
import { RequiredOrgRole } from './decorators/required-org-role.decorator'
import { CreateOrganisationDto } from './dto/create-organisation.dto'
import { InviteMemberDto } from './dto/invite-member.dto'
import { UpdateMemberRoleDto } from './dto/update-member-role.dto'
import { UpdateOrganisationDto } from './dto/update-organisation.dto'
import { OrganisationMember, OrganisationRole } from './entities/organisation-member.entity'
import { Organisation } from './entities/organisation.entity'
import { OrganisationRoleGuard } from './guards/organisation-role.guard'
import { GetOrganisationQuery, ListOrganisationMembersQuery, ListUserOrganisationsQuery } from './queries'

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('organisations')
@Controller('organisations')
export class OrganisationsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @ApiOperation({ summary: 'Create a new organisation' })
  @Post()
  create(@Body() dto: CreateOrganisationDto, @CurrentUser() user: CurrentUserPayload): Promise<Organisation> {
    return this.commandBus.execute<Organisation>(new CreateOrganisationCommand(dto, user.id))
  }

  @ApiOperation({ summary: 'List organisations for the current user' })
  @Get()
  listMine(
    @CurrentUser() user: CurrentUserPayload,
    @Query() pagination: PaginationQueryDto
  ): Promise<PaginatedResponseDto<Organisation>> {
    return this.queryBus.execute<PaginatedResponseDto<Organisation>>(
      new ListUserOrganisationsQuery(user.id, pagination.page, pagination.limit)
    )
  }

  @ApiOperation({ summary: 'Get an organisation by ID or slug' })
  @UseGuards(OrganisationRoleGuard)
  @RequiredOrgRole(OrganisationRole.STANDARD)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Organisation> {
    const org = await this.queryBus.execute<Organisation | null>(new GetOrganisationQuery(id))
    if (!org) throw new NotFoundException(`Organisation ${id} not found`)
    return org
  }

  @ApiOperation({ summary: 'Update an organisation' })
  @UseGuards(OrganisationRoleGuard)
  @RequiredOrgRole(OrganisationRole.ADMINISTRATOR)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateOrganisationDto): Promise<Organisation> {
    const org = await this.commandBus.execute<Organisation | null>(new UpdateOrganisationCommand(id, dto))
    if (!org) throw new NotFoundException(`Organisation ${id} not found`)
    return org
  }

  @ApiOperation({ summary: 'Delete an organisation' })
  @UseGuards(OrganisationRoleGuard)
  @RequiredOrgRole(OrganisationRole.OWNER)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Organisation> {
    const org = await this.commandBus.execute<Organisation | null>(new DeleteOrganisationCommand(id))
    if (!org) throw new NotFoundException(`Organisation ${id} not found`)
    return org
  }

  @ApiOperation({ summary: 'Transfer ownership to an existing member' })
  @UseGuards(OrganisationRoleGuard)
  @RequiredOrgRole(OrganisationRole.OWNER)
  @Post(':id/transfer-ownership')
  async transferOwnership(
    @Param('id') id: string,
    @Body() body: { userId: string },
    @CurrentUser() user: CurrentUserPayload
  ): Promise<OrganisationMember> {
    const member = await this.commandBus.execute<OrganisationMember | null>(
      new TransferOwnershipCommand(id, user.id, body.userId)
    )
    if (!member) throw new NotFoundException(`User ${body.userId} is not a member of this organisation`)
    return member
  }

  @ApiOperation({ summary: 'List members of an organisation' })
  @UseGuards(OrganisationRoleGuard)
  @RequiredOrgRole(OrganisationRole.STANDARD)
  @Get(':id/members')
  listMembers(
    @Param('id') id: string,
    @Query() pagination: PaginationQueryDto
  ): Promise<PaginatedResponseDto<OrganisationMember>> {
    return this.queryBus.execute<PaginatedResponseDto<OrganisationMember>>(
      new ListOrganisationMembersQuery(id, pagination.page, pagination.limit)
    )
  }

  @ApiOperation({ summary: 'Invite a user to the organisation' })
  @UseGuards(OrganisationRoleGuard)
  @RequiredOrgRole(OrganisationRole.ADMINISTRATOR)
  @Post(':id/members')
  inviteMember(@Param('id') id: string, @Body() dto: InviteMemberDto): Promise<OrganisationMember> {
    return this.commandBus.execute<OrganisationMember>(
      new InviteMemberCommand(id, dto.userId, dto.role ?? OrganisationRole.STANDARD)
    )
  }

  @ApiOperation({ summary: 'Remove a member from the organisation' })
  @UseGuards(OrganisationRoleGuard)
  @RequiredOrgRole(OrganisationRole.ADMINISTRATOR)
  @Delete(':id/members/:userId')
  async removeMember(@Param('id') id: string, @Param('userId') userId: string): Promise<OrganisationMember> {
    const member = await this.commandBus.execute<OrganisationMember | null>(new RemoveMemberCommand(id, userId))
    if (!member) throw new NotFoundException(`User ${userId} is not a member of this organisation`)
    return member
  }

  @ApiOperation({ summary: 'Update the role of a member' })
  @UseGuards(OrganisationRoleGuard)
  @RequiredOrgRole(OrganisationRole.ADMINISTRATOR)
  @Patch(':id/members/:userId/role')
  async updateMemberRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberRoleDto
  ): Promise<OrganisationMember> {
    const member = await this.commandBus.execute<OrganisationMember | null>(
      new UpdateMemberRoleCommand(id, userId, dto.role)
    )
    if (!member) throw new NotFoundException(`User ${userId} is not a member of this organisation`)
    return member
  }

  @ApiOperation({ summary: 'Leave an organisation' })
  @UseGuards(OrganisationRoleGuard)
  @RequiredOrgRole(OrganisationRole.STANDARD)
  @Delete(':id/leave')
  async leave(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload): Promise<OrganisationMember> {
    const member = await this.commandBus.execute<OrganisationMember | null>(new LeaveOrganisationCommand(id, user.id))
    if (!member) throw new NotFoundException('You are not a member of this organisation')
    return member
  }
}
