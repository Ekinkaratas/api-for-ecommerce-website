import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BulkVariantCreateResponseDto,
  CreateProductDto,
  CreateProductVariantDto,
  ProductResponseDto,
  ProductSearchResultDto,
  SearchProductDto,
  updateProductDto,
  PRODUCT_PATTERN,
} from 'contracts';
import { BaseMicroservice } from '../common/base/base-microservice.service';

@Injectable()
export class ProductsService extends BaseMicroservice {
  constructor(
    @Inject('PRODUCT_SERVICE') protected readonly client: ClientProxy,
  ) {
    super();
  }

  async create(dto: CreateProductDto) {
    return this.sendToClient<ProductResponseDto, CreateProductDto>(
      PRODUCT_PATTERN.CREATE,
      dto,
    );
  }

  async search(dto: SearchProductDto): Promise<ProductSearchResultDto> {
    return this.sendToClient<ProductSearchResultDto, SearchProductDto>(
      PRODUCT_PATTERN.SEARCH,
      dto,
    );
  }

  async findOne(id: number): Promise<ProductResponseDto> {
    return this.sendToClient<ProductResponseDto, number>(
      PRODUCT_PATTERN.FIND_ONE,
      id,
    );
  }

  async findBySlug(slug: string): Promise<ProductResponseDto> {
    return this.sendToClient<ProductResponseDto, string>(
      PRODUCT_PATTERN.FIND_BY_SLUG,
      slug,
    );
  }

  async findActive(id: number): Promise<ProductResponseDto> {
    return this.sendToClient<ProductResponseDto, number>(
      PRODUCT_PATTERN.FIND_ACTIVE,
      id,
    );
  }

  async update(id: number, dto: updateProductDto): Promise<ProductResponseDto> {
    return this.sendToClient<
      ProductResponseDto,
      { id: number; dto: updateProductDto }
    >(PRODUCT_PATTERN.UPDATE, { id, dto });
  }

  async remove(
    id: number,
    allDel: boolean,
    variantIds?: number[],
  ): Promise<boolean> {
    return this.sendToClient<
      boolean,
      { id: number; variantIds?: number[]; allDel: boolean }
    >(PRODUCT_PATTERN.DELETE, { id, variantIds, allDel });
  }

  async createVariants(
    id: number,
    dto: CreateProductVariantDto[],
  ): Promise<BulkVariantCreateResponseDto | void> {
    return this.sendToClient<
      BulkVariantCreateResponseDto | void,
      { id: number; dto: CreateProductVariantDto[] }
    >(PRODUCT_PATTERN.CREATE_VARIANTS, { id, dto });
  }
}
