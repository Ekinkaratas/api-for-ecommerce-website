import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class userForAuthResponse {
  @ApiProperty({ example: '1' })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({ example: 'api@gmail.com' })
  @IsString()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'Arda' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Tas' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  role!: string;

  @IsString()
  @IsNotEmpty()
  status!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  passwordHash?: string;
}
