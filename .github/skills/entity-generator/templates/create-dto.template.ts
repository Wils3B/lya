import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateResourceDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Resource Name', description: 'The name of the resource' })
  name: string

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Resource description',
    description: 'Optional description',
    required: false,
  })
  description?: string

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    example: true,
    description: 'Whether the resource is active',
    default: true,
  })
  isActive?: boolean
}
