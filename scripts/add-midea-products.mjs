// Adds Midea inverter (R32) units from the 20% discount price list.
// Unit only / DR price — installation not included.
// Run: node --env-file=.env scripts/add-midea-products.mjs
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const series = [
  {
    name: 'Breeze', features: 'fast cooling', type: 'Wall Mounted', category: 'residential',
    units: [
      ['1.0', 'MSAF-10CRDN8', 'MOAF-10CRDN8', 26995, 21596],
      ['1.5', 'MSAF-13CRDN8', 'MOAF-13CRDN8', 31995, 25596],
      ['2.0', 'MSAF-18CRDN8', 'MOAF-18CRDN8', 38995, 31196],
      ['2.5', 'MSAF-24CRDN8', 'MOAF-24CRDN8', 46995, 37596],
    ],
  },
  {
    name: 'Xtreme', features: 'powerful cooling', type: 'Wall Mounted', category: 'residential',
    units: [
      ['1.0', 'MSAG-10CRFN8', 'MOAG-10CRFN8', 30995, 24796],
      // Flyer prints 25,796 here, but SRP 35,995 − 7,199 discount = 28,796.
      ['1.5', 'MSAG-13CRFN8', 'MOAG-13CRFN8', 35995, 28796],
      ['2.0', 'MSAG-18CRFN8', 'MOAG-18CRFN8', 43995, 35196],
      ['2.5', 'MSAG-24CRFN8', 'MOAG-24CRFN8', 52995, 42396],
    ],
  },
  {
    name: 'Fresh', features: 'healthy clean air', type: 'Wall Mounted', category: 'residential',
    units: [
      ['1.0', 'MSAF-10CDN8', 'MOAF-10CDN8', 28995, 23196],
      ['1.5', 'MSAF-13CDN8', 'MOAF-13CDN8', 33995, 27196],
      ['2.0', 'MSAF-18CDN8', 'MOAF-18CDN8', 40995, 32796],
      ['2.5', 'MSAF-24CDN8', 'MOAF-24CDN8', 49995, 39996],
    ],
  },
  {
    name: 'Ultimate Comfort', features: 'AI eco mode', type: 'Wall Mounted', category: 'residential',
    units: [
      ['1.0', 'MSAG-10HRFN8', 'MOAG-10HRFN8', 33995, 27196],
      ['1.5', 'MSAG-13HRFN8', 'MOAG-13HRFN8', 39995, 31996],
      ['2.0', 'MSAG-18HRFN8', 'MOAG-18HRFN8', 48995, 39196],
      ['2.5', 'MSAG-24HRFN8', 'MOAG-24HRFN8', 58995, 47196],
    ],
  },
  {
    name: 'Floor Mounted', features: 'wide airflow, energy saving', type: 'Floor Standing', category: 'commercial',
    units: [
      ['3.0', 'MFM-36CRFN8', 'MOU-36CRFN8', 84995, 67996],
      ['5.0', 'MFM-60CRFN8', 'MOU-60CRFN8', 114995, 91996],
    ],
  },
  {
    name: 'Cassette', features: '360° airflow, quiet operation', type: 'Ceiling Cassette', category: 'commercial',
    units: [
      ['3.0', 'MCA3U-36CRFN8', 'MOU-36CRFN8', 84995, 67996],
      ['5.0', 'MCA3U-60CRFN8', 'MOU-60CRFN8', 114995, 91996],
    ],
  },
];

const peso = (n) => `₱${n.toLocaleString('en-PH')}`;

const products = series.flatMap((s) =>
  s.units.map(([hp, indoor, outdoor, srp, price]) => {
    const name = `Midea ${s.name} ${hp}HP Inverter`;
    const imageKey = s.name.toLowerCase().replace(/ /g, '-');
    return {
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      name,
      brand: 'Midea',
      category: s.category,
      subcategory: s.type,
      price,
      priceWithInstallation: null,
      images: [`/images/products/midea-${imageKey}.jpg`],
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
        `Midea ${s.name} Series ${hp}HP ${s.type} Inverter. Indoor: ${indoor} / Outdoor: ${outdoor}. ` +
        `R32 refrigerant, ${s.features}, durable & reliable. ` +
        `SRP ${peso(srp)} — 20% off, now ${peso(price)}. ` +
        `Unit only / DR price — installation not included. Pickup at warehouse. With parts warranty.`,
    };
  })
);

async function main() {
  console.log('Adding', products.length, 'Midea products...');
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
