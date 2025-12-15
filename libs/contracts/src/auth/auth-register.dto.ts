import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class authRegisterDto {
  @ApiProperty({ example: 'api@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: '55xxxxxxxx' })
  @IsPhoneNumber('TR')
  @IsNotEmpty()
  phoneNumber!: string;

  @ApiProperty({ example: 'ABC123...' })
  @IsNotEmpty()
  @IsString()
  password!: string;

  @ApiProperty({ example: 'Arda' })
  @IsNotEmpty()
  @IsString()
  firstname!: string;

  @ApiProperty({ example: 'Tas' })
  @IsNotEmpty()
  @IsString()
  lastname!: string;
}
