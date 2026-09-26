// Adds Koppel inverter (R32) units from the 20% discount price list.
// Unit only / DR price — installation not included.
// Run: node --env-file=.env scripts/add-koppel-products.mjs
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const series = [
  {
    name: 'Lunaire', feature: 'Fast Cooling', type: 'Wall Mounted', category: 'residential',
    units: [
      ['1.0', 'KES-10WFI-ARF32', 33995, 27196],
      ['1.5', 'KES-13WFI-ARF32', 38295, 30636],
      ['2.0', 'KES-18WFI-ARF32', 48895, 39116],
      ['2.5', 'KES-24WFI-ARF32', 56795, 45436],
      ['3.0', 'KES-30WFI-ARF32', 77295, 61836],
    ],
  },
  {
    name: 'Verdant', feature: 'Energy Saving', type: 'Wall Mounted', category: 'residential',
    units: [
      ['1.0', 'KES-10WVI-ARF32', 31995, 25596],
      ['1.5', 'KES-13WVI-ARF32', 35995, 28796],
      ['2.0', 'KES-18WVI-ARF32', 45995, 36796],
      ['2.5', 'KES-24WVI-ARF32', 53995, 43196],
      ['3.0', 'KES-30WVI-ARF32', 69995, 55996],
    ],
  },
  {
    name: 'Arctic', feature: 'Turbo Cooling', type: 'Wall Mounted', category: 'residential',
    units: [
      ['1.0', 'KES-10WAI-ARF32', 36995, 29596],
      ['1.5', 'KES-13WAI-ARF32', 41995, 33596],
      ['2.0', 'KES-18WAI-ARF32', 52995, 42396],
      ['2.5', 'KES-24WAI-ARF32', 62995, 50396],
      ['3.0', 'KES-30WAI-ARF32', 78995, 63196],
    ],
  },
  {
    name: 'Elite', feature: 'Super Cooling', type: 'Wall Mounted', category: 'residential',
    units: [
      ['1.0', 'KES-10WEI-ARF32', 39995, 31996],
      ['1.5', 'KES-13WEI-ARF32', 45995, 36796],
      ['2.0', 'KES-18WEI-ARF32', 56995, 45596],
      ['2.5', 'KES-24WEI-ARF32', 67995, 54396],
      ['3.0', 'KES-30WEI-ARF32', 83995, 67196],
    ],
  },
  {
    name: 'Floor Mounted', feature: 'Wide Airflow', type: 'Floor Standing', category: 'commercial',
    units: [
      ['3.0', 'KFS-36WFI-ARF32', 104995, 83996, 'KOS-36WFI-ARF32'],
      ['4.0', 'KFS-48WFI-ARF32', 125995, 100796, 'KOS-48WFI-ARF32'],
      ['5.0', 'KFS-60WFI-ARF32', 149995, 119996, 'KOS-60WFI-ARF32'],
    ],
  },
];

const peso = (n) => `₱${n.toLocaleString('en-PH')}`;

const products = series.flatMap((s) =>
  s.units.map(([hp, indoor, srp, price, outdoor]) => {
    const name = `Koppel ${s.name} ${hp}HP Inverter`;
    const models = outdoor ? `Indoor: ${indoor} / Outdoor: ${outdoor}` : `Indoor: ${indoor}`;
    return {
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      name,
      brand: 'Koppel',
      category: s.category,
      subcategory: s.type,
      price,
      priceWithInstallation: null,
      images: [`/images/products/koppel-${s.name.toLowerCase().replace(/ /g, '-')}.jpg`],
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
        `Koppel ${s.name} Series ${hp}HP ${s.type} Inverter. ${models}. ` +
        `R32 refrigerant, WiFi ready, ${s.feature.toLowerCase()}, durable & reliable. ` +
        `SRP ${peso(srp)} — 20% off, now ${peso(price)}. ` +
        `Unit only / DR price — installation not included. Pickup at warehouse. With parts warranty.`,
    };
  })
);

async function main() {
  console.log('Adding', products.length, 'Koppel products...');
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
