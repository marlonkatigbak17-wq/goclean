// Adds OX Aircon inverter units from the 20% discount price list.
// Unit only / DR price — installation not included.
// Run: node --env-file=.env scripts/add-ox-products.mjs
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// [model, capacity, srp, discountedPrice, existingSlug?]
const series = [
  {
    key: 'wall', label: 'Wall Mounted', type: 'Wall Mounted', category: 'residential',
    features: 'Inverter technology, fast cooling, energy saving, golden fin, durable & reliable.',
    units: [
      ['OX-W09-PVF', '1.0HP', 27799, 22239.2, 'ox-w09-pvf-1-0hp-wallmounted-inverter'],
      ['OX-W12-PVF', '1.5HP', 31349, 25079.2],
      ['OX-W18-VF', '2.0HP', 39899, 31919.2],
      ['OX-W24-VF', '2.5HP', 46899, 37519.2],
      ['OX-W30-VFM', '3.0HP', 58999, 47199.2],
    ],
  },
  {
    key: 'floor', label: 'Floor Mounted', type: 'Floor Standing', category: 'commercial',
    features: 'Powerful cooling, energy saving, heavy duty performance, 4D air flow, golden fin, durable & reliable. 230V/1PH/60Hz.',
    units: [
      ['OFMI-36CSM-32', '3TR', 106999, 85599.2],
      ['OFMI-60CSM-32', '5TR', 148999, 119199.2, 'ox-aircon-ofmi-60csm-32-floormounted-inverter-5tr'],
    ],
  },
];

const peso = (n) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2 })}`;

const products = series.flatMap((s) =>
  s.units.map(([model, capacity, srp, price, existingSlug]) => {
    const name = `OX Aircon ${capacity} ${s.label} Inverter (${model})`;
    return {
      slug: existingSlug ?? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      name,
      brand: 'OX Aircon',
      category: s.category,
      subcategory: s.type,
      price,
      priceWithInstallation: null,
      images: [`/images/products/ox-${s.key}.jpg`],
      specs: {
        horsepower: capacity.replace('HP', ' HP').replace('TR', ' TR'),
        coolingCapacity: '',
        energyEfficiency: 'Inverter',
        warranty: 'With parts warranty',
      },
      inStock: true,
      published: true,
      badge: 'Sale',
      description:
        `OX Aircon ${model} ${capacity} ${s.label} Inverter. ${s.features} ` +
        `SRP ${peso(srp)} — 20% off, now ${peso(price)}. ` +
        `Unit only / DR price — installation not included. Pickup at warehouse. With parts warranty.`,
    };
  })
);

async function main() {
  console.log('Adding', products.length, 'OX Aircon products...');
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
