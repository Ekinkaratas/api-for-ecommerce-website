import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class authLogin {
  @ApiProperty({ example: 'api@gmail.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '55xxxxxxxx', required: false })
  @IsPhoneNumber('TR')
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ example: 'ABC123...' })
  @IsNotEmpty()
  @IsString()
  password!: string;
}
