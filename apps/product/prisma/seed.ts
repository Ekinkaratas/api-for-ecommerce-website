import 'dotenv/config';

import { PrismaClient } from '../src/generated/prisma/client';
import CategorySeed from './seed/CategorySeed';
import TagSeed from './seed/TagSeed';
import { BrandSeeder } from './seed/BrandSeed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding process started...');

  const categorySeeder = new CategorySeed(5);
  const categoriesData = categorySeeder.data;

  if (categoriesData.length > 0) {
    console.log(`📦 ${categoriesData.length} categories generated.`);

    await prisma.category.createMany({
      data: categoriesData,
      skipDuplicates: true,
    });

    console.log('✅ Categories saved to DB.');
  }

  const tagSeeder = new TagSeed();
  const tagsData = tagSeeder.data;

  if (tagsData.length > 0) {
    console.log(`🏷️  ${tagsData.length} tags generated.`);

    await prisma.tag.createMany({
      data: tagsData,
      skipDuplicates: true,
    });

    console.log('✅ Tags saved to DB.');
  }

  const brandSeeder = new BrandSeeder(7);
  const brandsData = brandSeeder.data;

  if (brandsData.length > 0) {
    console.log(`🏢 ${brandsData.length} brands generated.`);

    await prisma.brand.createMany({
      data: brandsData,
      skipDuplicates: true,
    });

    console.log('✅ Brands saved to DB.');
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
