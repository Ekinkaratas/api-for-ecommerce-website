import { Prisma } from '../../src/generated/prisma/client';
import Seeder from './seeder';

const REALISTIC_TAGS = [
  'Summer Season',
  'Winter Season',
  'Outlet',
  'New Arrivals',
  'Best Sellers',
  'Limited Stock',
  'Free Shipping',
  'Cotton',
  'Leather',
  'Waterproof',
  'Unisex',
  'Gift Items',
  'Domestic Production',
  'Premium',
];

class TagSeed extends Seeder<Prisma.TagCreateManyInput> {
  constructor(count: number = REALISTIC_TAGS.length) {
    super(count);
    this.createData();
  }

  protected createData(): void {
    const uniqueTags = new Set<string>();

    let createdCount = 0;

    let attempts = 0;
    const maxAttempts = 100;

    while (createdCount < this.count && attempts < maxAttempts) {
      const tagName = REALISTIC_TAGS[attempts % REALISTIC_TAGS.length];

      if (!uniqueTags.has(tagName)) {
        uniqueTags.add(tagName);
        this.data.push({
          name: tagName,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        createdCount++;
      }
      attempts++;
    }
  }
}

export default TagSeed;
