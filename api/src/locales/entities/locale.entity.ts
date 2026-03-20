import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'
import { Direction } from './direction.enum'

@Entity()
export class Locale extends BaseEntity {
  @Column({ unique: true })
  @ApiProperty({ example: 'fr-BE', description: 'BCP 47 language code' })
  code: string

  @Column()
  @ApiProperty({ example: 'French (Belgium)' })
  name: string

  @Column()
  @ApiProperty({ example: 'Français (Belgique)' })
  nativeName: string

  @Column({ type: 'varchar' })
  @ApiProperty({ enum: Direction, example: Direction.LTR })
  direction: Direction
}
