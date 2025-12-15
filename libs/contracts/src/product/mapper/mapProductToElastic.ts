import { ProductIndexDto, EsTagDto } from '../dto/product-index.dto';
import { ProductStatus } from '../enum/product-Status.enum';

interface DecimalLike {
  toNumber(): number;
  toString(): string;
}

type PriceType = number | string | DecimalLike;

export interface ProductSource {
  id: number;
  title: string;
  description: string;
  slug: string;

  price: PriceType;
  stock: number;
  sku?: string;

  status: string;

  createdAt: Date;

  brandId?: number;
  brand?: { name: string };

  categoryId: number;
  category?: { name: string };

  tags?: Array<{
    id: number;
    name: string;
  }>;

  images?: Array<{ url: string; isMain: boolean }>;
}

const mapStatus = (status: string): ProductStatus => {
  const s = String(status).toUpperCase();

  switch (s) {
    case 'ACTIVE':
      return ProductStatus.ACTIVE;
    case 'INACTIVE':
      return ProductStatus.INACTIVE;
    case 'ARCHIVED':
      return ProductStatus.ARCHIVED;
    case 'DELETED':
      return ProductStatus.DELETED;
    default:
      return ProductStatus.INACTIVE;
  }
};

const parsePrice = (value?: PriceType | null): number => {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'object' && 'toNumber' in value) {
    return value.toNumber();
  }
  const stringVal = String(value);
  const parsed = parseFloat(stringVal);
  return isNaN(parsed) ? 0 : parsed;
};

const generateTagSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export function mapProductToElastic(entity: ProductSource): ProductIndexDto {
  return {
    id: entity.id,
    title: entity.title,
    description: entity.description,
    slug: entity.slug,

    price: parsePrice(entity.price),
    stock: entity.stock,
    sku: entity.sku || undefined,

    brandId: entity.brandId || undefined,
    brandName: entity.brand?.name || '',

    categoryId: entity.categoryId,
    categoryName: entity.category?.name || '',

    tags:
      entity.tags?.map(
        (tag): EsTagDto => ({
          id: tag.id,
          name: tag.name,
          slug: generateTagSlug(tag.name),
        }),
      ) || [],

    mainImage:
      entity.images?.find((img) => img.isMain)?.url ||
      entity.images?.[0]?.url ||
      '',

    images: entity.images?.map((img) => img.url) || [],

    status: mapStatus(entity.status),
    createdAt: entity.createdAt,
  };
}
