import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsArray,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SortOption {
  RELEVANCE = 'relevance',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  NEWEST = 'newest',
  TOP_RATED = 'top_rated',
}

export class SearchProductDto {
  @ApiPropertyOptional({
    description: 'Product name or description to search for',
    example: 'Running Shoe',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({
    description: 'Category ID to be filtered',
    example: 15,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({
    description: 'Brand IDs (Multiple selections possible)',
    example: [1, 2],
    type: [Number],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  brandIds?: number[];

  @ApiPropertyOptional({
    description: 'Minimum Price',
    example: 100,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum Price',
    example: 5000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Dynamic attribute filters (Color, Size, etc.)',
    example: { color: 'red', size: ['M', 'L'] },
    type: 'object',
    additionalProperties: {
      oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    },
  })
  @IsOptional()
  attributes?: Record<string, string | string[]>;

  @ApiPropertyOptional({
    description: 'Page Number',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of records per page',
    example: 20,
    default: 20,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Ranking criterion',
    enum: SortOption,
    enumName: 'SortOption',
    default: SortOption.RELEVANCE,
    example: SortOption.PRICE_ASC,
  })
  @IsOptional()
  @IsEnum(SortOption)
  sort?: SortOption = SortOption.RELEVANCE;

  @ApiPropertyOptional({
    description: 'Bring only what is in stock',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  inStock?: boolean;
}
