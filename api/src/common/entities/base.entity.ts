import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { ObjectId } from 'mongodb'
import { CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { UnifiedId } from '../decorators/unified-id.decorator'

export abstract class BaseEntity {
  @UnifiedId()
  @ApiProperty()
  @Transform(({ value }) => (value instanceof ObjectId ? value.toHexString() : value))
  id: number | ObjectId

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date

  @UpdateDateColumn()
  @ApiProperty()
  updatedAt: Date
}
