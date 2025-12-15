import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ProductStatus } from '../enum/product-Status.enum';
import { ProductImageDto } from './product-image.dto';
import { updateProductVariantDto } from './update-Product-Variant.dto';

export class updateProductDto {
  @ApiPropertyOptional({
    example: 'iPhone 15 Pro',
    description: "The product's new title",
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    example: 'A great phone...',
    description: 'Product description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 999.99,
    description: 'Product price',
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    example: [1, 2, 5],
    description: 'Related tag IDs',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tagIds?: number[];

  @ApiPropertyOptional({
    enum: ProductStatus,
    enumName: 'ProductStatus',
    example: ProductStatus.ACTIVE,
    description: 'Ürün durumu',
  })
  @IsOptional()
  @IsEnum(ProductStatus, {
    message: 'status must be one of: active, inactive, deleted and archived',
  })
  status?: ProductStatus;

  @ApiPropertyOptional({
    type: [ProductImageDto],
    description: 'Product images',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

  @ApiPropertyOptional({
    type: [updateProductVariantDto],
    description: 'Product variants (color, size, etc.)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => updateProductVariantDto)
  variants?: updateProductVariantDto[];
}
