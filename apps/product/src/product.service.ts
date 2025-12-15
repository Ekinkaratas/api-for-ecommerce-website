import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  BulkVariantCreateResponseDto,
  CreateProductDto,
  CreateProductVariantDto,
  ProductImageDto,
  ProductResponseDto,
  ProductSearchResultDto,
  ProductStatus,
  SearchProductDto,
  updateProductDto,
} from 'contracts';
import { PrismaService } from './prisma.service';
import { Prisma } from './generated/prisma/client';
import slugify from 'slugify';
import {
  ProductSearchService,
  StatusUpdateScope,
} from '../search/productSearch.service';

// Stock Control (Race Condition) will be added later
/*
  To prevent issues when two people update stock simultaneously during high traffic,
  the order service will be updated using atomic increment/decrement operations.
*/

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    variants: true;
    tags: { include: { tag: true } };
    brand: true;
    category: true;
  };
}>;

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ES: ProductSearchService,
  ) {}

  async createProduct(dto: CreateProductDto): Promise<ProductResponseDto> {
    let attempt = 0;
    let isCreated = false;
    let currentSlug = this.generateSlug(dto.title);
    let product: ProductWithRelations | undefined;

    while (!isCreated && attempt < 5) {
      try {
        product = await this.prisma.product.create({
          data: {
            title: dto.title,
            slug: currentSlug,
            description: dto.description,
            price: dto.price,
            stock: dto.stock,
            images: dto.images as unknown as Prisma.JsonArray,
            brand: dto.brandId ? { connect: { id: dto.brandId } } : undefined,
            category: dto.categoryId
              ? { connect: { id: dto.categoryId } }
              : undefined,
            variants: {
              create: dto.variants?.map((variant) => ({
                sku: variant.sku,
                attributes: variant.attributes,
                price: variant.price,
                stock: variant.stock,
                barcode: variant.barcode,
              })),
            },
            tags: {
              create: dto.tagIds?.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            },
          },
          include: {
            brand: true,
            category: true,
            variants: true,
            tags: {
              include: {
                tag: true,
              },
            },
          },
        });

        isCreated = true;
      } catch (error) {
        this.handleSlugConflict(error, () => {
          attempt++;
          const suffix = this.generateRandomSuffix();
          currentSlug = this.generateSlug(dto.title, suffix);
        });
      }

      if (!isCreated || !product) {
        throw new InternalServerErrorException(
          'Slug could not be created or product could not be saved.',
        );
      }

      await this.ES.indexNewProduct(product);

      return this.mapToDto(product);
    }
  }

  async updateProductAndVariants(
    productId: number,
    dto: updateProductDto,
  ): Promise<ProductResponseDto> {
    const updateProduct = await this.prisma.$transaction<ProductWithRelations>(
      async (tx) => {
        const existingProduct = await tx.product.findUnique({
          where: { id: productId },
          include: { variants: true },
        });

        if (!existingProduct) {
          throw new NotFoundException('No product to update found.');
        }
        const { variants, status, tagIds, images, ...mainData } = dto;

        await tx.product.update({
          where: { id: productId },
          data: {
            ...mainData,
            status: status ? (status as unknown as ProductStatus) : undefined,
            images: images
              ? (images as unknown as Prisma.JsonArray)
              : undefined,
          },
        });

        if (tagIds) {
          await tx.productTag.deleteMany({
            where: { productId },
          });
          if (tagIds.length > 0) {
            await tx.productTag.createMany({
              data: tagIds.map((tagId) => ({
                productId,
                tagId: tagId,
              })),
              skipDuplicates: true,
            });
          }
        }
        if (variants) {
          for (const variantDto of variants) {
            if (variantDto.id) {
              const variantExists = existingProduct.variants.find(
                (v) => v.id === variantDto.id,
              );

              if (variantExists) {
                await tx.productVariant.update({
                  where: { id: variantDto.id },
                  data: {
                    sku: variantDto.sku,
                    price: variantDto.price,
                    stock: variantDto.stock,
                    attributes: variantDto.attributes,
                    status:
                      variantDto.stock === 0
                        ? ProductStatus.INACTIVE
                        : ProductStatus.ACTIVE,
                  },
                });
              }
            }
          }
        }

        return await tx.product.findUniqueOrThrow({
          where: { id: productId },
          include: {
            variants: true,
            tags: { include: { tag: true } },
            brand: true,
            category: true,
          },
        });
      },
    );

    await this.ES.indexUpdateProduct(updateProduct);
    await this.ES.indexUpdateVariant(updateProduct);

    return this.mapToDto(updateProduct);
  }

  async createProductVariants(
    productId: number,
    dto: CreateProductVariantDto[],
  ): Promise<BulkVariantCreateResponseDto | void> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        brand: true,
        category: true,
      },
    });

    if (!product) throw new NotFoundException('Product not found.');

    try {
      const newVariants = await this.prisma.productVariant.createManyAndReturn({
        data: dto.map((variant) => ({
          productId: productId,
          sku: variant.sku,
          attributes: variant.attributes,
          price: variant.price,
          stock: variant.stock,
          barcode: variant.barcode,
          status:
            variant.stock === 0 ? ProductStatus.INACTIVE : ProductStatus.ACTIVE,
        })),
        select: {
          id: true,
          sku: true,
          attributes: true,
          stock: true,
          price: true,
          status: true,
          barcode: true,
        },
        skipDuplicates: false,
      });
      await this.ES.indexNewProductVariants(product, newVariants);

      return {
        success: true,
        count: newVariants.length,
        message: `${newVariants.length} variants were successfully added.`,
        data: newVariants.map((v) => ({
          id: v.id,
          sku: v.sku,
          stock: v.stock,
          price: Number(v.price),
          status: v.status as unknown as ProductStatus,
          attributes: v.attributes as unknown as Record<string, any>,
          barcode: v.barcode || undefined,
        })),
      };
    } catch (error) {
      this.handlePrismaError(
        error,
        'An error occurred while creating variants.',
      );
    }
  }

  async getProduct(productId: number): Promise<ProductResponseDto> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        include: {
          brand: true,
          category: true,
          variants: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });
      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found.`);
      }

      return this.mapToDto(product);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handlePrismaError(
        error,
        'An error occurred while retrieving the product.',
      );
    }
  }

  async deleteProduct(
    productId: number,
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    variantIds: number[] | undefined,
    allDel: boolean,
  ): Promise<boolean> {
    const now = new Date();
    let scope: StatusUpdateScope;
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    let esVariantIds: number[] | undefined = undefined;

    try {
      if (variantIds && variantIds.length > 0 && !allDel) {
        const result = await this.prisma.productVariant.updateMany({
          where: {
            productId: productId,
            id: { in: variantIds },
          },
          data: {
            status: ProductStatus.DELETED,
            deletedAt: now,
          },
        });

        if (result.count === 0) {
          throw new NotFoundException('No variants to be deleted were found..');
        }

        scope = StatusUpdateScope.VARIANT_LIST;
        esVariantIds = variantIds;
      } else {
        const updateData: Prisma.ProductUpdateInput = {
          status: ProductStatus.DELETED,
          deletedAt: now,
        };

        if (allDel) {
          updateData.variants = {
            updateMany: {
              where: {},
              data: { status: ProductStatus.DELETED, deletedAt: now },
            },
          };
          scope = StatusUpdateScope.PRODUCT_WITH_VARIANTS;
        } else {
          scope = StatusUpdateScope.PRODUCT_ONLY;
        }

        await this.prisma.product.update({
          where: { id: productId },
          data: updateData,
        });
      }

      await this.ES.changeStatus({
        productId,
        status: ProductStatus.DELETED,
        scope: scope,
        variantIds: esVariantIds,
      });

      return true;
    } catch (error) {
      this.handlePrismaError(
        error,
        `An error occurred while deleting the product (ID: ${productId}).`,
      );
      return false;
    }
  }

  async findProductWithActiveVariants(
    productId: number,
  ): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          where: { status: ProductStatus.ACTIVE },
          orderBy: { createdAt: 'desc' },
        },
        brand: true,
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!product) throw new NotFoundException('Product not found.');

    if (product.status === 'DELETED' && product.variants.length === 0) {
      throw new NotFoundException('This product is no longer available..');
    }

    return this.mapToDto(product);
  }

  async findBySlug(slug: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        category: true,
        variants: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return this.mapToDto(product);
  }

  async searchAndFilterProducts(
    dto: SearchProductDto,
  ): Promise<ProductSearchResultDto> {
    const product = await this.ES.searchProducts(dto);

    if (!product) throw new NotFoundException('Product not found');

    return product;
  }

  private generateSlug(title: string, suffix?: string): string {
    let slug = slugify(title, { lower: true, strict: true, trim: true });
    if (suffix) {
      slug += `-${suffix}`;
    }
    return slug;
  }

  private generateRandomSuffix(length = 4): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private handleSlugConflict(error: unknown, retryCallback: () => void) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const meta = error.meta as { target?: string[] };
      const target = meta?.target;
      if (Array.isArray(target) && target.includes('slug')) {
        retryCallback();
        return;
      }
    }
    this.handlePrismaError(error, 'Product creation conflict error.');
  }

  private handlePrismaError(error: unknown, defaultMessage: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = error.meta?.target;
        throw new ConflictException(
          `This record already exists. (${Array.isArray(target) ? target.join(', ') : 'Unknown'})`,
        );
      }
      if (error.code === 'P2025' || error.code === 'P2003') {
        throw new NotFoundException(
          'No relevant record found or invalid relationship.',
        );
      }
    }

    if (
      error instanceof NotFoundException ||
      error instanceof BadRequestException ||
      error instanceof ConflictException
    ) {
      throw error;
    }

    console.error('Database Error:', error);
    throw new InternalServerErrorException(defaultMessage);
  }

  private mapToDto(product: ProductWithRelations): ProductResponseDto {
    return {
      id: product.id,
      title: product.title,
      slug: product.slug,
      description: product.description,
      stock: product.stock,
      sku: product.sku,
      createdAt: product.createdAt,

      price: product.price ? Number(product.price) : 0,

      status: product.status as unknown as ProductStatus,

      images: product.images as unknown as ProductImageDto[],

      brand: product.brand
        ? {
            id: product.brand.id,
            name: product.brand.name,
            logo: product.brand.logo,
          }
        : null,

      category: product.category
        ? {
            id: product.category.id,
            name: product.category.name,
            slug: product.category.slug,
          }
        : null,

      tags: product.tags
        ? product.tags.map((t) => ({
            id: t.tag.id,
            name: t.tag.name,
          }))
        : [],

      variants: product.variants
        ? product.variants.map((v) => ({
            id: v.id,
            sku: v.sku,
            stock: v.stock,
            barcode: v.barcode,
            price: v.price ? Number(v.price) : 0,
            status: v.status as unknown as ProductStatus,
            attributes: v.attributes as unknown as Record<string, any>,
          }))
        : [],
    };
  }
}
