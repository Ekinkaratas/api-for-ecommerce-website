import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { CreateProductVariantDto } from './create-Product-Variant.dto';
import { ProductImageDto } from './product-image.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'red patterned pants', description: 'product name' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'product description' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    example: 999.99,
    description: 'Product price',
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  price!: number;

  @ApiProperty({
    example: 15,
    description: 'Number of products in stock',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  stock: number;

  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({
    example: '2',
    description: 'brand ID',
  })
  @IsOptional()
  @IsInt()
  brandId?: number;

  @ApiPropertyOptional({
    example: '2',
    description: 'category id',
  })
  @IsInt()
  @IsNotEmpty()
  categoryId?: number;

  @ApiPropertyOptional({
    example: '[1,2,3,4,....]',
    description: 'product tag ID(s)',
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tagIds?: number[];

  @ApiPropertyOptional({
    type: () => ProductImageDto,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

  @ApiPropertyOptional({
    type: () => CreateProductVariantDto,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants?: CreateProductVariantDto[];
}
