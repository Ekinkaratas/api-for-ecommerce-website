import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BrandResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Nike' })
  name: string;

  @ApiPropertyOptional({ example: 'logo.png' })
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  logo?: string | null;
}

export class CategoryResponseDto {
  @ApiProperty({ example: 10 })
  id: number;

  @ApiProperty({ example: 'Sports Shoes' })
  name: string;

  @ApiProperty({ example: 'Sports-Shoes' })
  slug: string;
}

export class TagResponseDto {
  @ApiProperty({ example: 5 })
  id: number;

  @ApiProperty({ example: 'New Season' })
  name: string;
}
