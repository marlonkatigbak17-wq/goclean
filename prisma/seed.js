const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const products = require('../src/data/products.json');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database with', products.length, 'products...');
  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        brand: p.brand,
        category: p.category,
        subcategory: p.subcategory,
        price: p.price,
        priceWithInstallation: p.priceWithInstallation || null,
        images: p.images || [],
        specs: p.specs || {},
        inStock: p.inStock !== false,
        badge: p.badge || null,
        description: p.description || '',
      },
      create: {
        id: p.id,
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        category: p.category,
        subcategory: p.subcategory,
        price: p.price,
        priceWithInstallation: p.priceWithInstallation || null,
        images: p.images || [],
        specs: p.specs || {},
        inStock: p.inStock !== false,
        badge: p.badge || null,
        description: p.description || '',
      },
    });
    console.log(' ✓', p.name);
  }
  console.log('Done!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
