import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { ObjectId } from 'mongodb'
import { Column, CreateDateColumn, Entity } from 'typeorm'
import { UnifiedForeignKey } from '../../common/decorators/unified-foreign-key.decorator'
import { BaseEntity } from '../../common/entities/base.entity'

@Entity()
export class ProjectLocale extends BaseEntity {
  @UnifiedForeignKey()
  @ApiProperty({ description: 'Project ID' })
  @Transform(({ value }) => (value instanceof ObjectId ? value.toHexString() : String(value)))
  projectId: number | ObjectId

  @Column()
  @ApiProperty({ description: 'BCP 47 locale code, e.g. en, fr-BE' })
  localeCode: string

  @CreateDateColumn()
  @ApiProperty()
  addedAt: Date
}
