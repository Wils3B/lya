import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class TransferOwnershipDto {
  @ApiProperty({ description: 'ID of the user to transfer ownership to' })
  @IsString()
  @IsNotEmpty()
  userId: string
}
