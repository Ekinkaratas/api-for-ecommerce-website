import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsNumber,
  IsObject,
  IsEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '../enum/product-Status.enum';

export class updateProductVariantDto {
  @ApiPropertyOptional({
    example: '1',
  })
  @IsInt()
  @IsOptional()
  id: number;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiPropertyOptional({
    example: 999.99,
    description: 'Ürün fiyati',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({
    enum: ProductStatus,
    enumName: 'ProductStatus',
  })
  @IsOptional()
  @IsEnum(ProductStatus, {
    message: 'status must be one of: active, inactive, deleted and archived',
  })
  status?: ProductStatus;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  stock?: number;

  @IsObject()
  @IsOptional()
  attributes?: Record<string, any>;
}
