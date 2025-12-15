import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '../enum/product-Status.enum';
import { IsEnum } from 'class-validator';

export class EsTagDto {
  @ApiProperty({ example: 1, description: 'Label ID' })
  id: number;

  @ApiProperty({ example: 'New Season', description: 'Display name' })
  name: string;

  @ApiProperty({
    example: 'new-season',
    description: 'URL-friendly name (slug)',
  })
  slug: string;
}

export class ProductIndexDto {
  @ApiProperty({ example: 101, description: 'Product ID' })
  id: number;

  @ApiProperty({ example: 'Nike Air Zoom', description: 'Product Title' })
  title: string;

  @ApiProperty({
    example: 'Ideal for running...',
    description: 'Product Description',
  })
  description: string;

  @ApiProperty({ example: 'nike-air-zoom', description: 'URL Slug' })
  slug: string;

  @ApiProperty({ example: 2500.5, description: 'Price' })
  price: number;

  @ApiProperty({ example: 50, description: 'Stock Quantity' })
  stock: number;

  @ApiPropertyOptional({
    example: 'NK-123-BK',
    description: 'Stock Code (SKU)',
  })
  sku?: string;

  @ApiPropertyOptional({ example: 5, description: 'Brand ID' })
  brandId?: number;

  @ApiPropertyOptional({ example: 'Nike', description: 'Brand Name' })
  brandName?: string;

  @ApiProperty({ example: 10, description: 'Category ID' })
  categoryId: number;

  @ApiProperty({ example: 'Sports Shoes', description: 'Category Name' })
  categoryName: string;

  @ApiProperty({
    type: () => [EsTagDto],
    description: 'Product labels',
    example: [{ id: 1, name: 'Summer house', slug: 'Summer_house' }],
  })
  tags: EsTagDto[];

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/main.jpg',
    description: 'Main Image URL',
  })
  mainImage?: string;

  @ApiProperty({
    type: [String],
    example: ['img1.jpg', 'img2.jpg'],
    description: 'All image URLs',
  })
  images: string[];

  @ApiProperty({
    example: '2023-12-14T10:00:00Z',
    description: 'Date Created',
  })
  createdAt: Date;

  @ApiProperty({
    enum: ProductStatus,
    enumName: 'ProductStatus',
    example: ProductStatus.ACTIVE,
    description: 'Product Status',
  })
  @IsEnum(ProductStatus)
  status: ProductStatus;
}
