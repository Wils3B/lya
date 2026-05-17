import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class AddLocaleDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'BCP 47 locale code, e.g. en, fr-BE' })
  localeCode: string
}
