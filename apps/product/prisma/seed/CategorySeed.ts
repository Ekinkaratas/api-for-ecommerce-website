// apps/product/prisma/CategorySeed.ts
import { faker } from '@faker-js/faker';
import { Prisma } from '../../src/generated/prisma/client';
import Seeder from './seeder';

class CategorySeed extends Seeder<Prisma.CategoryCreateManyInput> {
  constructor(count: number = 5) {
    super(count);
    this.createData();
  }

  protected createData(): void {
    for (let i = 0; i < this.count; i++) {
      const name: string = faker.commerce.department();
      const randomId: number = faker.number.int({ min: 1, max: 1000 });
      const slug: string = `${name.toLowerCase().replace(/[\s\W-]+/g, '-')}-${randomId}`;

      this._data.push({
        name: name,
        slug: slug,
        parentId: null,
      });
    }
  }
}

export default CategorySeed;
