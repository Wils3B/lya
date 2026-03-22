import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { ObjectId } from 'mongodb'
import { Column, CreateDateColumn, Entity } from 'typeorm'
import { UnifiedForeignKey } from '../../common/decorators/unified-foreign-key.decorator'
import { BaseEntity } from '../../common/entities/base.entity'
import { ProjectRole } from './project-role.enum'

@Entity()
export class ProjectMember extends BaseEntity {
  @UnifiedForeignKey()
  @ApiProperty({ description: 'Project ID' })
  @Transform(({ value }) => (value instanceof ObjectId ? value.toHexString() : String(value)))
  projectId: number | ObjectId

  @UnifiedForeignKey()
  @ApiProperty({ description: 'User ID' })
  @Transform(({ value }) => (value instanceof ObjectId ? value.toHexString() : String(value)))
  userId: number | ObjectId

  @Column({ type: 'varchar', nullable: false })
  @ApiProperty({ enum: ProjectRole })
  role: ProjectRole

  @CreateDateColumn()
  @ApiProperty()
  joinedAt: Date
}
