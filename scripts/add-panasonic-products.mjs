// Adds Panasonic inverter units from the 20% discount price list.
// Unit only / DR price — installation not included.
// Run: node --env-file=.env scripts/add-panasonic-products.mjs
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// units: [hp, model, srp, discountedPrice, noteOverride?]
const series = [
  {
    key: 'inverter', label: 'Inverter', suffix: '(No WiFi)',
    features: 'inverter technology, powerful cooling, quiet operation. No WiFi',
    units: [
      // Flyer header says "CS/U QU9-24" but the table lists the PU…AKQ model codes.
      ['1.0', 'CS/CU-PU9AKQ', 39599, 31679.2],
      ['1.5', 'CS/CU-PU12AKQ', 44899, 35919.2],
      ['2.0', 'CS/CU-PU18AKQ', 57499, 45999.2],
      ['2.5', 'CS/CU-PU24AKQ', 68999, 55199.2],
    ],
  },
  {
    key: 'basic', label: 'Basic Inverter', suffix: 'WiFi',
    features: 'inverter technology, WiFi ready, powerful cooling',
    units: [
      ['1.0', 'CS/CU-PU9AKQ', 43499, 34799.2],
      ['1.5', 'CS/CU-PU12AKQ', 49299, 39439.2],
      ['2.0', 'CS/CU-PU18AKQ', 63199, 50559.2],
      ['2.5', 'CS/CU-PU24AKQ', 75199, 60159.2],
      ['3.0', 'CS/CU-PU30AKQ', 89999, 71999.2],
      ['4.0', 'CS/CU-PU36WKQ', 129999, 103999.2, 'inverter technology, powerful cooling. No WiFi on this model'],
    ],
  },
  {
    key: 'deluxe', label: 'Deluxe nanoe', suffix: 'WiFi Inverter',
    features: 'nanoe™ technology, WiFi ready, powerful cooling',
    units: [
      ['1.0', 'CS/CU-RU9AKQ', 48999, 39199.2],
      ['1.5', 'CS/CU-RU12AKQ', 54899, 43919.2],
      ['2.0', 'CS/CU-RU18AKQ', 69299, 55439.2],
      ['2.5', 'CS/CU-RU24AKQ', 82899, 66319.2],
    ],
  },
  {
    key: 'premium', label: 'Premium nanoeX', suffix: 'WiFi Inverter',
    features: 'nanoe™ X technology, WiFi ready, energy saving',
    units: [
      ['1.0', 'CS/CU-XU9AKQ', 54999, 43999.2],
      ['1.5', 'CS/CU-XU12AKQ', 61299, 49039.2],
      ['2.0', 'CS/CU-XU18AKQ', 75899, 60719.2],
      ['2.5', 'CS/CU-XU24AKQ', 89499, 71599.2],
      ['3.0', 'CS/CU-XU30AKQ', 109699, 87759.2, 'nanoe™ technology (nanoe only on this model), WiFi ready, energy saving'],
    ],
  },
];

const peso = (n) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2 })}`;

const products = series.flatMap((s) =>
  s.units.map(([hp, model, srp, price, note]) => {
    const suffix = hp === '4.0' && s.key === 'basic' ? 'Inverter (No WiFi)' : s.suffix;
    const name = `Panasonic ${s.label} ${hp}HP ${suffix}`;
    return {
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      name,
      brand: 'Panasonic',
      category: 'residential',
      subcategory: 'Wall Mounted',
      price,
      priceWithInstallation: null,
      images: [`/images/products/panasonic-${s.key}.jpg`],
      specs: {
        horsepower: `${hp} HP`,
        coolingCapacity: '',
        energyEfficiency: 'Inverter',
        warranty: 'With parts warranty',
      },
      inStock: true,
      published: true,
      badge: 'Sale',
      description:
        `Panasonic ${s.label} ${hp}HP Wall Mounted Split Type. Model: ${model}. ` +
        `${note ?? s.features}, durable & reliable. ` +
        `SRP ${peso(srp)} — 20% off, now ${peso(price)}. ` +
        `Unit only / DR price — installation not included. Pickup at warehouse. With parts warranty.`,
    };
  })
);

async function main() {
  console.log('Adding', products.length, 'Panasonic products...');
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
