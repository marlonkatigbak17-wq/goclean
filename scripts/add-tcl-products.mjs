// Adds TCL inverter units from the 20% discount price list.
// DR price, pickup at warehouse — installation not included.
// Run: node --env-file=.env scripts/add-tcl-products.mjs
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// units: [hp, model, srp, discountedPrice]
const series = [
  {
    label: 'Eco-In', type: 'CSV/TA Eco-In (new)',
    features: 'Eco inverter, WiFi ready, fast cooling',
    units: [
      ['1.0', 'TAC09KEI/KEIS', 35995, 28796],
      ['1.5', 'TAC12HPKEIS', 37995, 30396],
      // Flyer rounds 51,459 − 10,292 discount down to 41,167.
      ['2.0', 'TAC18HPKEIS', 51459, 41167],
      ['2.5', 'TAC2.5KEIS', 57495, 45996],
      ['3.0', 'TAC3HPKEIS', 80495, 64396],
    ],
  },
  {
    label: 'VOXin', type: '(WEI) 2025 VOXin',
    features: 'WiFi + offline voice command, powerful cooling',
    units: [
      ['1.0', 'TAC10WEI', 45995, 36796],
      ['1.5', 'TAC13WEI', 49995, 39996],
      ['2.0', 'TAC19WEI', 57995, 46396],
      // Flyer SRP is 69,996 (not …995) and discounted price 55,997.
      ['2.5', 'TAC25WEI', 69996, 55997],
    ],
  },
  {
    label: 'FRESHin', type: 'CSD 2025 FRESHin',
    features: 'fresh air technology, WiFi + FRESHin voice command, clean & fresh air',
    units: [
      ['1.0', 'TAC11CSDP7', 50995, 40796],
      ['1.5', 'TAC14CSDP7', 54995, 43996],
      ['2.0', 'TAC19CSDP7', 62995, 50396],
    ],
  },
];

const peso = (n) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2 })}`;

const products = series.flatMap((s) =>
  s.units.map(([hp, model, srp, price]) => {
    const name = `TCL ${s.label} ${hp}HP WiFi Inverter`;
    return {
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      name,
      brand: 'TCL',
      category: 'residential',
      subcategory: 'Wall Mounted',
      price,
      priceWithInstallation: null,
      images: [],
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
        `TCL ${s.type} ${hp}HP Wall Mounted Inverter. Model: ${model}. ` +
        `${s.features}, durable & reliable. ` +
        `SRP ${peso(srp)} — 20% off, now ${peso(price)}. ` +
        `DR price — installation not included. Pickup at warehouse. With parts warranty.`,
    };
  })
);

async function main() {
  console.log('Adding', products.length, 'TCL products...');
  for (const p of products) {
    // Keep existing images on update — photos are added separately.
    const { slug, images: _images, ...data } = p;
    await prisma.product.upsert({ where: { slug }, update: data, create: p });
    console.log(' ✓', p.name, peso(p.price));
  }
  console.log('Done!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
