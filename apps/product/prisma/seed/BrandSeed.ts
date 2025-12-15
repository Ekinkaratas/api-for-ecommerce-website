import { Prisma } from '../../src/generated/prisma';
import { faker } from '@faker-js/faker';
import Seeder from './seeder';

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export class BrandSeeder extends Seeder<Prisma.BrandCreateInput> {
  constructor(count: number = 7) {
    super(count);
    this.createData();
  }

  protected createData(): void {
    for (let i = 0; i < this.count; i++) {
      const name = faker.company.name();
      const slug = `${slugify(name)}-${faker.number.int({ min: 1, max: 999 })}`;

      const brand: Prisma.BrandCreateInput = {
        name: name,
        slug: slug,
      };

      this._data.push(brand);
    }
  }
}
