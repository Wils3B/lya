import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'

@Entity()
export class Post extends BaseEntity {
  @Column()
  @ApiProperty()
  title: string

  @Column()
  @ApiProperty()
  content: string

  @Column({ default: false })
  @ApiProperty()
  published: boolean
}
