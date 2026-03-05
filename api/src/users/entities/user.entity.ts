import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'

@Entity()
export class User extends BaseEntity {
  @Column()
  @ApiProperty()
  name: string

  @Column({ unique: true })
  @ApiProperty()
  email: string
}
