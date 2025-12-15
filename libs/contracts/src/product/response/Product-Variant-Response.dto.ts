import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '../enum/product-Status.enum';

export class ProductVariantResponseDto {
  @ApiProperty({ example: 101 })
  id: number;

  @ApiProperty({ example: 'NK-AIR-38' })
  sku: string;

  @ApiProperty({ example: 2500.5 })
  price: number;

  @ApiProperty({ example: 100 })
  stock: number;

  @ApiProperty({
    example: { color: 'Red', size: '38' },
    description: 'Properties in JSON format',
  })
  attributes: any;

  @ApiPropertyOptional({ example: '8690000001' })
  barcode?: string;

  @ApiProperty({ enum: ProductStatus })
  status: ProductStatus;
}
