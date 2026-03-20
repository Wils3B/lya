import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CommandHandlers } from './commands/handlers'
import { OrganisationMember } from './entities/organisation-member.entity'
import { Organisation } from './entities/organisation.entity'
import { OrganisationRoleGuard } from './guards/organisation-role.guard'
import { OrganisationsController } from './organisations.controller'
import { QueryHandlers } from './queries/handlers'
import { OrganisationMemberRepository } from './repositories/organisation-member.repository'
import { OrganisationRepository } from './repositories/organisation.repository'

@Module({
  imports: [TypeOrmModule.forFeature([Organisation, OrganisationMember])],
  controllers: [OrganisationsController],
  providers: [
    OrganisationRepository,
    OrganisationMemberRepository,
    OrganisationRoleGuard,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class OrganisationsModule {}
