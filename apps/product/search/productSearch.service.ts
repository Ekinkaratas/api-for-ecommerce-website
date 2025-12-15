import { BadRequestException, Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Prisma } from '../src/generated/prisma/client';
import {
  mapProductToElastic,
  ProductImageDto,
  SearchProductDto,
  SortOption,
  VariantIndexDto,
  ProductStatus,
} from 'contracts';

type FullProduct = Prisma.ProductGetPayload<{
  include: {
    brand: true;
    category: true;
    variants: true;
    tags: { include: { tag: true } };
  };
}>;

type UpdateProduct = Prisma.ProductGetPayload<{
  include: { variants: true; tags: { include: { tag: true } } };
}>;

export type ParentProductWithRelations = Prisma.ProductGetPayload<{
  include: { brand: true; category: true };
}>;

export enum StatusUpdateScope {
  PRODUCT_ONLY = 'PRODUCT_ONLY',
  VARIANT_SINGLE = 'VARIANT_SINGLE',
  PRODUCT_WITH_VARIANTS = 'PRODUCT_WITH_VARIANTS',
  VARIANTS_BY_PRODUCT = 'VARIANTS_BY_PRODUCT',
  VARIANT_LIST = 'VARIANT_LIST',
}

interface ChangeStatusParams {
  productId: number;
  status: ProductStatus;
  scope: StatusUpdateScope;
  variantId?: number;
  variantIds?: number[];
}

export interface RawNewVariant {
  id: number;
  sku: string;
  stock: number;
  price: Prisma.Decimal;
  attributes: Prisma.JsonValue;
}

export interface ProductSearchResult {
  hits: any[];
  total: number;
  page: number;
  pages: number;
}

export interface AttributeDto {
  key: string;
  value: string;
}

interface ElasticsearchError {
  meta?: {
    statusCode?: number;
  };
  message?: string;
}

function isElasticsearchError(error: unknown): error is ElasticsearchError {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('meta' in error || 'message' in error)
  );
}

@Injectable()
export class ProductSearchService {
  constructor(private readonly esService: ElasticsearchService) {}

  async indexNewProduct(product: FullProduct) {
    await this.processIndexMainProduct(product);
    await this.processIndexVariants(product);
  }

  async indexNewProductVariants(
    product: ParentProductWithRelations,
    rawVariants: RawNewVariant[],
  ) {
    await this.processIndexNewProductVariants(product, rawVariants);
  }

  async indexUpdateProduct(product: UpdateProduct) {
    await this.processUpdateIndexMainProduct(product);
  }

  async indexUpdateVariant(product: UpdateProduct) {
    await this.processUpdateIndexVariants(product);
  }

  async changeStatus(dto: ChangeStatusParams) {
    await this.processChangeStatus(dto);
  }

  async searchProducts(params: SearchProductDto): Promise<ProductSearchResult> {
    return await this.executeSearch(params);
  }

  private getPriceAsNumber(
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    price: Prisma.Decimal | number | null | undefined,
  ): number {
    if (price === null || price === undefined) return 0;
    if (typeof price === 'object' && 'toNumber' in price) {
      return price.toNumber();
    }
    return Number(price);
  }
  private getMainImage(imagesJson: Prisma.JsonValue): string {
    const images = (imagesJson as unknown as ProductImageDto[]) || [];
    const mainImageObj = images.find((img) => img.isMain);
    return mainImageObj ? mainImageObj.url : images[0]?.url || '';
  }

  private transformAttributes(
    attrs: Prisma.JsonValue,
  ): { key: string; value: string; numValue?: number }[] {
    if (!attrs || typeof attrs !== 'object' || Array.isArray(attrs)) {
      return [];
    }

    const attributesObj = attrs as Record<string, unknown>;

    return Object.entries(attributesObj).map(([key, rawValue]) => {
      let numValue: number = undefined;
      let stringValue = '';

      if (
        typeof rawValue === 'string' ||
        typeof rawValue === 'number' ||
        typeof rawValue === 'boolean'
      ) {
        stringValue = String(rawValue);
      } else if (rawValue === null) {
        stringValue = '';
      } else {
        stringValue = JSON.stringify(rawValue);
      }

      if (typeof rawValue === 'number') {
        numValue = rawValue;
      } else if (typeof rawValue === 'string') {
        const match = rawValue.match(/^(\d+(\.\d+)?)/);
        if (match && !isNaN(parseFloat(match[0]))) {
          numValue = parseFloat(match[0]);
        }
      }

      return { key, value: stringValue, numValue };
    });
  }

  private async processIndexMainProduct(product: FullProduct) {
    const flatTags = product.tags.map((pivot) => ({
      id: pivot.tag.id,
      name: pivot.tag.name,
    }));

    const images = (product.images as unknown as ProductImageDto[]) || [];

    const source = {
      ...product,
      tags: flatTags,
      images: images,
    };

    const doc = mapProductToElastic(source);

    await this.esService.index({
      index: 'product',
      id: product.id.toString(),
      document: doc,
    });
  }

  private async processIndexVariants(product: FullProduct) {
    if (!product.variants || product.variants.length === 0) return;

    const bulkOperations: any[] = [];
    const mainImage = this.getMainImage(product.images);

    for (const variant of product.variants) {
      const formattedAttributes = this.transformAttributes(variant.attributes);
      const priceVal = this.getPriceAsNumber(variant.price ?? product.price);

      const doc: VariantIndexDto = {
        id: `${product.id}-${variant.id}`,
        productId: product.id,
        variantId: variant.id,
        title: `${product.title} ${variant.sku ? '- ' + variant.sku : ''}`,
        slug: product.slug,
        price: priceVal,
        stock: variant.stock,
        sku: variant.sku,
        brandName: product.brand?.name || '',
        categoryName: product.category?.name || '',
        image: mainImage,
        attributes: formattedAttributes,
      };

      bulkOperations.push({ index: { _index: 'variants', _id: doc.id } });
      bulkOperations.push(doc);
    }

    if (bulkOperations.length > 0) {
      await this.esService.bulk({ body: bulkOperations });
    }
  }

  private async processUpdateIndexMainProduct(product: UpdateProduct) {
    const flatTags = product.tags.map((pivot) => ({
      id: pivot.tag.id,
      name: pivot.tag.name,
    }));

    const images = (product.images as unknown as ProductImageDto[]) || [];
    const priceVal = this.getPriceAsNumber(product.price);

    const source = {
      ...product,
      price: priceVal,
      tags: flatTags,
      images: images,
    };

    const mapDoc = mapProductToElastic(source);
    const doc = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(mapDoc).filter(([_, value]) => value !== undefined),
    );

    try {
      await this.esService.update({
        index: 'product',
        id: product.id.toString(),
        doc: doc,
      });
    } catch (error) {
      let isNotFound = false;

      if (isElasticsearchError(error)) {
        isNotFound =
          error.meta?.statusCode === 404 ||
          (error.message
            ? error.message.includes('document_missing_exception')
            : false);
      }

      if (isNotFound) {
        console.warn(
          `[ES Sync Warning] product (ID: ${product.id}) Could not be found in ES.`,
        );
      } else {
        console.error('Unexpected Elasticsearch Error:', error);
        throw error;
      }
    }
  }

  private async processUpdateIndexVariants(product: UpdateProduct) {
    if (!product.variants || product.variants.length === 0) return;

    const bulkOperations: any[] = [];
    const mainImage = this.getMainImage(product.images);

    for (const variant of product.variants) {
      const formattedAttributes = this.transformAttributes(variant.attributes);
      const priceVal = this.getPriceAsNumber(variant.price ?? product.price);

      const doc = {
        id: `${product.id}-${variant.id}`,
        productId: product.id,
        variantId: variant.id,
        title: `${product.title} ${variant.sku ? '- ' + variant.sku : ''}`,
        slug: product.slug,
        price: priceVal,
        stock: variant.stock,
        sku: variant.sku,
        image: mainImage,
        attributes: formattedAttributes,
      };

      bulkOperations.push({ index: { _index: 'variants', _id: doc.id } });
      bulkOperations.push(doc);
    }

    if (bulkOperations.length > 0) {
      await this.esService.bulk({ body: bulkOperations });
    }
  }

  private async processIndexNewProductVariants(
    product: ParentProductWithRelations,
    rawVariants: RawNewVariant[],
  ) {
    if (!rawVariants || rawVariants.length === 0) return;

    const bulkOperations: any[] = [];
    const mainImage = this.getMainImage(product.images);

    for (const variant of rawVariants) {
      const formattedAttributes =
        (variant.attributes as unknown as AttributeDto[]) || [];
      const esAttributes = formattedAttributes.map((attr) => ({
        key: attr.key,
        value: attr.value,
      }));

      const priceVal = this.getPriceAsNumber(variant.price);

      const doc = {
        id: `${product.id}-${variant.id}`,
        productId: product.id,
        variantId: variant.id,
        title: `${product.title} ${variant.sku ? '- ' + variant.sku : ''}`,
        slug: product.slug,
        price: priceVal,
        stock: variant.stock,
        sku: variant.sku,
        brandName: product.brand?.name || '',
        categoryName: product.category?.name || '',
        image: mainImage,
        attributes: esAttributes,
      };

      bulkOperations.push({ index: { _index: 'variants', _id: doc.id } });
      bulkOperations.push(doc);
    }

    if (bulkOperations.length > 0) {
      await this.esService.bulk({ body: bulkOperations });
    }
  }

  private async processChangeStatus(params: ChangeStatusParams) {
    const { productId, status, scope, variantId, variantIds } = params;
    const operations: Promise<any>[] = [];
    const strProductId = productId.toString();

    if (
      scope === StatusUpdateScope.PRODUCT_ONLY ||
      scope === StatusUpdateScope.PRODUCT_WITH_VARIANTS
    ) {
      operations.push(
        this.esService
          .update({
            index: 'product',
            id: strProductId,
            doc: { status },
          })
          .catch((err: unknown) => {
            if (isElasticsearchError(err) && err.meta?.statusCode === 404) {
              console.warn(`[ES] product (ID: ${strProductId}) not found.`);
            }
          }),
      );
    }

    if (scope === StatusUpdateScope.VARIANT_LIST) {
      if (variantIds && variantIds.length > 0) {
        const esIds = variantIds.map((id) => `${productId}-${id}`);
        operations.push(
          this.esService.updateByQuery({
            index: 'variants',
            query: { terms: { _id: esIds } },
            script: {
              source: 'ctx._source.status = params.status',
              lang: 'painless',
              params: { status },
            },
          }),
        );
      }
    }

    if (scope === StatusUpdateScope.VARIANT_SINGLE) {
      if (!variantId)
        throw new BadRequestException(
          'The variantId is required for a single variant update..',
        );
      const compositeId = `${productId}-${variantId}`;
      operations.push(
        this.esService
          .update({
            index: 'variants',
            id: compositeId,
            doc: { status },
          })
          .catch((err: unknown) => {
            if (isElasticsearchError(err) && err.meta?.statusCode === 404) {
              console.warn(`[ES] variant (ID: ${compositeId}) not found .`);
            }
          }),
      );
    }

    if (
      scope === StatusUpdateScope.VARIANTS_BY_PRODUCT ||
      scope === StatusUpdateScope.PRODUCT_WITH_VARIANTS
    ) {
      operations.push(
        this.esService.updateByQuery({
          index: 'variants',
          query: { term: { productId: productId } },
          script: {
            source: 'ctx._source.status = params.status',
            lang: 'painless',
            params: { status },
          },
        }),
      );
    }

    await Promise.all(operations);
  }

  private async executeSearch(
    params: SearchProductDto,
  ): Promise<ProductSearchResult> {
    const {
      query,
      categoryId,
      brandIds,
      minPrice,
      maxPrice,
      attributes,
      inStock,
      page = 1,
      limit = 20,
      sort,
    } = params;
    const from = (page - 1) * limit;

    const mustQueries: any[] = [];
    const filterQueries: any[] = [];

    if (query) {
      mustQueries.push({
        multi_match: {
          query: query,
          fields: [
            'title^3',
            'description',
            'sku',
            'brandName',
            'categoryName',
          ],
          fuzziness: 'AUTO',
        },
      });
    } else {
      mustQueries.push({ match_all: {} });
    }

    if (categoryId) filterQueries.push({ term: { categoryId: categoryId } });
    if (brandIds && brandIds.length > 0)
      filterQueries.push({ terms: { brandId: brandIds } });
    if (inStock) filterQueries.push({ range: { stock: { gt: 0 } } });

    if (minPrice !== undefined || maxPrice !== undefined) {
      const rangeQuery: Record<string, number> = {};
      if (minPrice !== undefined) rangeQuery.gte = minPrice;
      if (maxPrice !== undefined) rangeQuery.lte = maxPrice;
      filterQueries.push({ range: { price: rangeQuery } });
    }

    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        const values = Array.isArray(value) ? value : [value];
        filterQueries.push({
          nested: {
            path: 'attributes',
            query: {
              bool: {
                must: [
                  { match: { 'attributes.key': key } },
                  { terms: { 'attributes.value': values } },
                ],
              },
            },
          },
        });
      });
    }

    const sortQuery: any[] = [];
    switch (sort) {
      case SortOption.PRICE_ASC:
        sortQuery.push({ price: 'asc' });
        break;
      case SortOption.PRICE_DESC:
        sortQuery.push({ price: 'desc' });
        break;
      case SortOption.NEWEST:
        sortQuery.push({ createdAt: 'desc' });
        break;
      case SortOption.RELEVANCE:
      default:
        sortQuery.push({ _score: 'desc' });
        break;
    }

    const { hits } = await this.esService.search({
      index: 'product',
      from: from,
      size: limit,
      query: {
        bool: { must: mustQueries, filter: filterQueries },
      },
      sort: sortQuery,
    });

    const total =
      typeof hits.total === 'object' ? hits.total.value : hits.total;

    return {
      hits: hits.hits.map((hit) => hit._source),
      total: total,
      page: page,
      pages: Math.ceil(total / limit),
    };
  }
}
