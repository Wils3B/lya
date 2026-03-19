import { ApiProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'
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

  @Column({ select: false })
  @ApiProperty({ writeOnly: true, minLength: 8 })
  @Exclude()
  password: string

  @Column({ nullable: true, select: false })
  @Exclude()
  refreshTokenHash: string | null
}
