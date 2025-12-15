import { IsBoolean, IsNotEmpty, IsString, IsInt } from 'class-validator';

export class ProductImageDto {
  @IsString()
  @IsNotEmpty()
  url!: string;

  @IsBoolean()
  isMain: boolean = false;

  @IsInt()
  order: number = 0;
}
