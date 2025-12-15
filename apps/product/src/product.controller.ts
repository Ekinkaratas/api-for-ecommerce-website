import { Controller } from '@nestjs/common';
import { ProductService } from './product.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateProductDto,
  CreateProductVariantDto,
  SearchProductDto,
  updateProductDto,
  PRODUCT_PATTERN,
} from 'contracts';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @MessagePattern(PRODUCT_PATTERN.SEARCH)
  search(@Payload() dto: SearchProductDto) {
    return this.productService.searchAndFilterProducts(dto);
  }

  @MessagePattern(PRODUCT_PATTERN.FIND_ONE)
  findOne(@Payload() id: number) {
    return this.productService.getProduct(id);
  }

  @MessagePattern(PRODUCT_PATTERN.FIND_BY_SLUG)
  findBySlug(@Payload() slug: string) {
    return this.productService.findBySlug(slug);
  }

  @MessagePattern(PRODUCT_PATTERN.FIND_ACTIVE)
  findActive(@Payload() id: number) {
    return this.productService.findProductWithActiveVariants(id);
  }

  @MessagePattern(PRODUCT_PATTERN.CREATE)
  create(@Payload() dto: CreateProductDto) {
    return this.productService.createProduct(dto);
  }

  @MessagePattern(PRODUCT_PATTERN.UPDATE)
  update(@Payload() payload: { id: number; dto: updateProductDto }) {
    return this.productService.updateProductAndVariants(
      payload.id,
      payload.dto,
    );
  }

  @MessagePattern(PRODUCT_PATTERN.DELETE)
  remove(
    @Payload() payload: { id: number; variantIds?: number[]; allDel: boolean },
  ) {
    return this.productService.deleteProduct(
      payload.id,
      payload.variantIds,
      payload.allDel,
    );
  }

  @MessagePattern(PRODUCT_PATTERN.CREATE_VARIANTS)
  createVariants(
    @Payload() payload: { id: number; dto: CreateProductVariantDto[] },
  ) {
    return this.productService.createProductVariants(payload.id, payload.dto);
  }
}
