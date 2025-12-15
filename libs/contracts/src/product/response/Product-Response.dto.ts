import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '../enum/product-Status.enum';
import {
  BrandResponseDto,
  CategoryResponseDto,
  TagResponseDto,
} from './Relations-Response.dto';
import { ProductVariantResponseDto } from './Product-Variant-Response.dto';
import { ProductImageDto } from '../dto/product-image.dto';

export class ProductResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Nike Air Max' })
  title: string;

  @ApiProperty({ example: 'nike-air-max' })
  slug: string;

  @ApiProperty({ example: 'A great running shoe...' })
  description: string;

  @ApiProperty({ example: 2500.5 })
  price: number;

  @ApiProperty({ example: 500 })
  stock: number;

  @ApiPropertyOptional({ example: 'NK-AIR-MAIN' })
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  sku?: string | null;

  @ApiProperty({ enum: ProductStatus })
  status: ProductStatus;

  @ApiProperty({ type: [ProductImageDto] })
  images: ProductImageDto[];

  @ApiProperty({ example: '2023-12-01T10:00:00Z' })
  createdAt: Date;

  @ApiPropertyOptional({ type: () => BrandResponseDto })
  brand?: BrandResponseDto | null;

  @ApiPropertyOptional({ type: () => CategoryResponseDto })
  category?: CategoryResponseDto | null;

  @ApiPropertyOptional({ type: () => [ProductVariantResponseDto] })
  variants?: ProductVariantResponseDto[];

  @ApiPropertyOptional({ type: () => [TagResponseDto] })
  tags?: TagResponseDto[] | { tag: TagResponseDto }[];
}
