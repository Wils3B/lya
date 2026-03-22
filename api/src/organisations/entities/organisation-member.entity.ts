import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { ObjectId } from 'mongodb'
import { Column, CreateDateColumn, Entity } from 'typeorm'
import { UnifiedForeignKey } from '../../common/decorators/unified-foreign-key.decorator'
import { BaseEntity } from '../../common/entities/base.entity'

export enum OrganisationRole {
  OWNER = 'owner',
  ADMINISTRATOR = 'administrator',
  STANDARD = 'standard',
}

@Entity()
export class OrganisationMember extends BaseEntity {
  @UnifiedForeignKey()
  @ApiProperty({ description: 'Organisation ID' })
  @Transform(({ value }) => (value instanceof ObjectId ? value.toHexString() : String(value)))
  organisationId: number | ObjectId

  @UnifiedForeignKey()
  @ApiProperty({ description: 'User ID' })
  @Transform(({ value }) => (value instanceof ObjectId ? value.toHexString() : String(value)))
  userId: number | ObjectId

  @Column({ type: 'varchar', nullable: false })
  @ApiProperty({ enum: OrganisationRole })
  role: OrganisationRole

  @CreateDateColumn()
  @ApiProperty()
  joinedAt: Date
}
