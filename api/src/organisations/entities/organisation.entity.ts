import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'

@Entity()
export class Organisation extends BaseEntity {
  @Column()
  @ApiProperty()
  name: string

  @Column({ unique: true })
  @ApiProperty()
  slug: string

  @Column({ nullable: true })
  @ApiProperty({ nullable: true, required: false })
  description: string | null
}
