import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, Index } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'

@Entity()
@Index(['email'], { unique: true })
export class User extends BaseEntity {
  @Column()
  @ApiProperty()
  name: string

  @Column({ unique: true })
  @ApiProperty()
  email: string
}
