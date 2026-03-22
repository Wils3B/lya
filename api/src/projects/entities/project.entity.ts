import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { ObjectId } from 'mongodb'
import { Column, Entity } from 'typeorm'
import { UnifiedForeignKey } from '../../common/decorators/unified-foreign-key.decorator'
import { BaseEntity } from '../../common/entities/base.entity'

@Entity()
export class Project extends BaseEntity {
  @UnifiedForeignKey()
  @ApiProperty({ description: 'Organisation ID' })
  @Transform(({ value }) => (value instanceof ObjectId ? value.toHexString() : String(value)))
  organisationId: number | ObjectId

  @Column()
  @ApiProperty()
  name: string

  @Column()
  @ApiProperty()
  slug: string

  @Column({ nullable: true })
  @ApiPropertyOptional()
  description: string | null
}
