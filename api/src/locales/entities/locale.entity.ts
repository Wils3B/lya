import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
export class Locale {
  @PrimaryColumn()
  @ApiProperty({ example: 'en', description: 'BCP 47 locale code' })
  code: string

  @Column()
  @ApiProperty({ example: 'English' })
  name: string

  @Column()
  @ApiProperty({ example: 'English' })
  nativeName: string

  @Column()
  @ApiProperty({ example: 'ltr', enum: ['ltr', 'rtl'] })
  direction: 'ltr' | 'rtl'
}
