import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsNumber,
  IsObject,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { ProductStatus } from '../enum/product-Status.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductVariantDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsOptional()
  barcode: string;

  @ApiPropertyOptional({
    example: 999.99,
    description: 'Product price',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  price?: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  stock: number;

  @IsObject()
  @IsNotEmpty()
  attributes: Record<string, any>;

  @ApiPropertyOptional({
    enum: ProductStatus,
    enumName: 'ProductStatus',
  })
  @IsOptional()
  @IsEnum(ProductStatus, {
    message: 'status must be one of: active, inactive, deleted and archived',
  })
  status: ProductStatus;
}
