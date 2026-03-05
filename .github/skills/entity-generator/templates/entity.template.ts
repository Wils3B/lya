import { Column, Entity } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { BaseEntity } from '../../common/entities/base.entity'

@Entity()
export class Resource extends BaseEntity {
  @Column()
  @ApiProperty({ example: 'Resource Name', description: 'The name of the resource' })
  name: string

  @Column({ nullable: true })
  @ApiProperty({
    example: 'Resource description',
    description: 'Optional description',
    required: false,
  })
  description?: string

  @Column({ default: true })
  @ApiProperty({ example: true, description: 'Whether the resource is active' })
  isActive: boolean
}
