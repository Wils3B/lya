import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { ObjectId } from 'mongodb'
import { Column, CreateDateColumn, Entity } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'

export enum OrganisationRole {
  OWNER = 'owner',
  ADMINISTRATOR = 'administrator',
  STANDARD = 'standard',
}

@Entity()
export class OrganisationMember extends BaseEntity {
  // Typed as number for SQL; at MongoDB runtime these may be ObjectId — handled in repository
  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: 'Organisation ID' })
  @Transform(({ value }) => (value instanceof ObjectId ? value.toHexString() : String(value as number)))
  organisationId: number

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: 'User ID' })
  @Transform(({ value }) => (value instanceof ObjectId ? value.toHexString() : String(value as number)))
  userId: number

  @Column({ type: 'varchar', nullable: false })
  @ApiProperty({ enum: OrganisationRole })
  role: OrganisationRole

  @CreateDateColumn()
  @ApiProperty()
  joinedAt: Date
}
