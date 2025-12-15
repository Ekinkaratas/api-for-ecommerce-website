import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class userRegisterDto {
  @ApiProperty({ example: 'api@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: '$argon2id$v=19$m=65536,t=3,p=4$...' })
  @IsNotEmpty()
  @IsString()
  password!: string;

  @ApiProperty({ example: 'Arda' })
  @IsNotEmpty()
  @IsString()
  firstName!: string;

  @ApiProperty({ example: 'Tas' })
  @IsNotEmpty()
  @IsString()
  lastName!: string;

  @ApiProperty({ example: '55xxxxxxxx' })
  @IsPhoneNumber('TR')
  @IsNotEmpty()
  @IsString()
  phoneNumber!: string;
}
