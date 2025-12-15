import { ApiProperty } from '@nestjs/swagger';
import { ProductVariantResponseDto } from './Product-Variant-Response.dto';

export class BulkVariantCreateResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 5 })
  count: number;

  @ApiProperty({ example: '5 variants have been successfully added.' })
  message: string;

  @ApiProperty({ type: [ProductVariantResponseDto] })
  data: ProductVariantResponseDto[];
}

export class ProductSearchResultDto {
  @ApiProperty({ type: [Object] })
  hits: any[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 5 })
  pages: number;
}
