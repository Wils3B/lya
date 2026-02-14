import { ApiProperty } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'
import { CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { UnifiedId } from '../decorators/unified-id.decorator'

export abstract class BaseEntity {
  @UnifiedId()
  @ApiProperty()
  id: number | ObjectId

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date

  @UpdateDateColumn()
  @ApiProperty()
  updatedAt: Date
}
