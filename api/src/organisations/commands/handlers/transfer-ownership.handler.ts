import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { OrganisationMember, OrganisationRole } from '../../entities/organisation-member.entity'
import { OrganisationMemberRepository } from '../../repositories/organisation-member.repository'
import { TransferOwnershipCommand } from '../transfer-ownership.command'

@CommandHandler(TransferOwnershipCommand)
export class TransferOwnershipHandler implements ICommandHandler<TransferOwnershipCommand, OrganisationMember | null> {
  constructor(private readonly memberRepository: OrganisationMemberRepository) {}

  async execute(command: TransferOwnershipCommand): Promise<OrganisationMember | null> {
    const targetMember = await this.memberRepository.findMembership(command.organisationId, command.targetUserId)
    if (!targetMember) return null

    const callerMember = await this.memberRepository.findMembership(command.organisationId, command.callerId)
    if (callerMember) {
      callerMember.role = OrganisationRole.ADMINISTRATOR
      await this.memberRepository.save(callerMember)
    }

    targetMember.role = OrganisationRole.OWNER
    return this.memberRepository.save(targetMember)
  }
}
