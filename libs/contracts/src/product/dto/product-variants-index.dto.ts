import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EsAttributeDto {
  @ApiProperty({
    example: 'Storage',
    description: 'Feature key (Filter header)',
  })
  key: string;

  @ApiProperty({
    example: '512 GB SSD',
    description: 'Text value to be displayed on the screen',
  })
  value: string;

  @ApiPropertyOptional({
    example: 512,
    description: 'Numeric value for filtering (or null if not available)',
    type: Number,
  })
  numValue?: number;
}

export class VariantIndexDto {
  @ApiProperty({
    example: '101-5',
    description:
      'Elasticsearch ID (Usually in the format “ProductId-VariantId”)',
  })
  id: string;

  @ApiProperty({
    example: 101,
    description: 'Parent Product ID it is associated with',
  })
  productId: number;

  @ApiProperty({ example: 5, description: 'Variant ID' })
  variantId: number;

  @ApiProperty({
    example: 'iPhone 15 Pro Max - 512GB',
    description: 'Full title for the variant',
  })
  title: string;

  @ApiProperty({ example: 'iphone-15-pro-max', description: 'URL Slug' })
  slug: string;

  @ApiProperty({ example: 95000, description: 'Selling Price' })
  price: number;

  @ApiProperty({ example: 12, description: 'Stock Quantity' })
  stock: number;

  @ApiProperty({
    example: 'APPLE-IP15-512-GR',
    description: 'Stock Code (SKU)',
  })
  sku: string;

  @ApiProperty({ example: 'Apple', description: 'Brand Name' })
  brandName: string;

  @ApiProperty({ example: 'Smartphone', description: 'Category Name' })
  categoryName: string;

  @ApiProperty({
    example: 'https://cdn.example.com/iphone15-grey.jpg',
    description: 'Variant image (May differ from the main product image)',
  })
  image: string;

  @ApiProperty({
    type: () => [EsAttributeDto],
    description: 'Variant features (Color, Memory, Size, etc.)',
    example: [
      { key: 'Color', value: 'Titanium Gray', numValue: null },
      { key: 'Memory', value: '512 GB', numValue: 512 },
    ],
  })
  attributes: EsAttributeDto[];
}
