// Adds Carrier inverter (R32) units from the 20% discount price list.
// Unit only / DR price — installation not included.
// Run: node --env-file=.env scripts/add-carrier-products.mjs
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const series = [
  {
    name: 'Aura', features: 'WiFi ready, fast cooling', type: 'Wall Mounted', category: 'residential',
    units: [
      ['1.0', '42TVAB010', '38TVAB010', 41000, 32800],
      ['1.5', '42TVAB013', '38TVAB013', 47000, 37600],
      ['2.0', '42TVAB018', '38TVAB018', 60000, 48000],
      ['2.5', '42TVAB024', '38TVAB024', 74000, 59200],
    ],
  },
  {
    name: 'Optima', features: 'WiFi ready, energy saving', type: 'Wall Mounted', category: 'residential',
    units: [
      ['1.0', '42TVCA010', '38TVCA010', 38000, 30400],
      ['1.5', '42TVCA013', '38TVCA013', 44000, 35200],
      ['2.0', '42TVCA018', '38TVCA018', 56000, 44800],
      ['2.5', '42TVCA024', '38TVCA024', 68000, 54400],
    ],
  },
  {
    name: 'Gemini', features: 'WiFi ready, powerful cooling', type: 'Wall Mounted', category: 'residential',
    units: [
      ['1.0', '42TVGA010', '38TVGA010', 35000, 28000],
      ['1.5', '42TVGA013', '38TVGA013', 41000, 32800],
      ['2.0', '42TVGA018', '38TVGA018', 52000, 41600],
      ['2.5', '42TVGA024', '38TVGA024', 63000, 50400],
    ],
  },
  {
    name: 'XPower', features: 'WiFi ready, turbo cooling', type: 'Wall Mounted', category: 'residential',
    units: [
      ['1.0', '42TVXA010', '38TVXA010', 39000, 31200],
      ['1.5', '42TVXA013', '38TVXA013', 45000, 36000],
      ['2.0', '42TVXA018', '38TVXA018', 57000, 45600],
      ['2.5', '42TVXA024', '38TVXA024', 70000, 56000],
    ],
  },
];

const peso = (n) => `₱${n.toLocaleString('en-PH')}`;

const products = series.flatMap((s) =>
  s.units.map(([hp, indoor, outdoor, srp, price]) => {
    const name = `Carrier ${s.name} ${hp}HP Inverter`;
    const imageKey = s.name.toLowerCase().replace(/ /g, '-');
    return {
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      name,
      brand: 'Carrier',
      category: s.category,
      subcategory: s.type,
      price,
      priceWithInstallation: null,
      images: [`/images/products/carrier-${imageKey}.jpg`],
      specs: {
        horsepower: `${hp} HP`,
        coolingCapacity: '',
        energyEfficiency: 'Inverter (R32)',
        warranty: 'With parts warranty',
      },
      inStock: true,
      published: true,
      badge: 'Sale',
      description:
        `Carrier ${s.name} Series ${hp}HP ${s.type} Inverter. Indoor: ${indoor} / Outdoor: ${outdoor}. ` +
        `R32 refrigerant, ${s.features}, durable & reliable. ` +
        `SRP ${peso(srp)} — 20% off, now ${peso(price)}. ` +
        `Unit only / DR price — installation not included. Pickup at warehouse. With parts warranty.`,
    };
  })
);

async function main() {
  console.log('Adding', products.length, 'Carrier products...');
  for (const p of products) {
    // Keep existing images on update — photos were moved to Vercel Blob after the first run.
    const { slug, images: _images, ...data } = p;
    await prisma.product.upsert({ where: { slug }, update: data, create: p });
    console.log(' ✓', p.name, peso(p.price));
  }
  console.log('Done!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
