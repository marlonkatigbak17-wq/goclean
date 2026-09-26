// Adds AUX inverter units from the 20% discount price list.
// Unit only / DR price — installation not included.
// Run: node --env-file=.env scripts/add-aux-products.mjs
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const series = [
  {
    key: 'futura', label: 'Futura', kind: 'Inverter', warranty: true,
    features: 'inverter technology, fast cooling, WiFi ready',
    units: [
      ['1.0', 'ASW09A2/CCDI', 32299, 25839.2],
      ['1.5', 'ASW12A2/CCDI', 36799, 29439.2],
      ['2.0', 'ASW18A2/CCDI', 46799, 37439.2],
      ['2.5', 'ASW24A2/CCDI', 56799, 45439.2],
    ],
  },
  {
    key: 'prima', label: 'Prima', kind: 'Full DC Inverter', warranty: true,
    features: 'full DC inverter, powerful cooling, WiFi ready',
    units: [
      ['1.0', 'ASW09A2/QCDI', 31399, 25119.2],
      ['1.5', 'ASW12A2/QCDI', 35899, 28719.2],
      ['2.0', 'ASW18A2/QCDI', 45899, 36719.2],
      ['2.5', 'ASW24A2/QCDI', 55899, 44719.2],
      ['3.0', 'ASW30A2/QCDI', 61899, 49519.2],
    ],
  },
  {
    key: 'auxfit-prima', label: 'AuxFit Prima', kind: 'Full DC Inverter', warranty: true,
    features: 'full DC inverter, energy saving, WiFi ready',
    units: [
      ['1.0', 'ASW09A2/QDDI', 29699, 23759.2],
      ['1.5', 'ASW12A2/QDDI', 34199, 27359.2],
      ['2.0', 'ASW18A2/QDDI', 44199, 35359.2],
      ['2.5', 'ASW24A2/QDDI', 54199, 43359.2],
      ['3.0', 'ASW30A2/QDDI', 60199, 48159.2],
    ],
  },
];

const peso = (n) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2 })}`;

const terms = (warranty) =>
  `Unit only / DR price — installation not included. Pickup at warehouse.${warranty ? ' With parts warranty.' : ''}`;

const products = series.flatMap((s) =>
  s.units.map(([hp, model, srp, price]) => {
    const name = `AUX ${s.label} ${hp}HP ${s.kind}`;
    return {
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      name,
      brand: 'AUX',
      category: 'residential',
      subcategory: 'Wall Mounted',
      price,
      priceWithInstallation: null,
      images: [`/images/products/aux-${s.key}.jpg`],
      specs: {
        horsepower: `${hp} HP`,
        coolingCapacity: '',
        energyEfficiency: s.kind,
        warranty: s.warranty ? 'With parts warranty' : '',
      },
      inStock: true,
      published: true,
      badge: 'Sale',
      description:
        `AUX ${s.label} Series ${hp}HP Wall Mounted ${s.kind}. Model: ${model}. ` +
        `${s.features}, durable & reliable. ` +
        `SRP ${peso(srp)} — 20% off, now ${peso(price)}. ${terms(s.warranty)}`,
    };
  })
);

// AUX F-Series 1.0HP (ASW09A2/FLDI) already exists with its own photo and full specs —
// only update the sale price, badge and pricing terms. Flyer lists no parts warranty for it.
const F_SERIES_SLUG = 'aux-f-series-1-0hp';
const F_SERIES_SPECS =
  'Power: 800(300-1500)W. Power Supply: 220-230V/1/60Hz. Cooling Capacity: 2.64(0.60-3.50) kW. ' +
  'Air Flow: 460 m3/h. R32 refrigerant (475g). Noise: Indoor 38 dB(A) / Outdoor 51 dB(A). ' +
  'Indoor: 693x283x199mm. Outdoor: 705x279x530mm. Weight: Indoor 7.5kg / Outdoor 21kg.';

async function main() {
  console.log('Adding', products.length, 'AUX products...');
  for (const p of products) {
    const { slug, ...data } = p;
    await prisma.product.upsert({ where: { slug }, update: data, create: p });
    console.log(' ✓', p.name, peso(p.price));
  }

  const fPrice = 25839.2;
  await prisma.product.update({
    where: { slug: F_SERIES_SLUG },
    data: {
      price: fPrice,
      priceWithInstallation: null,
      badge: 'Sale',
      inStock: true,
      published: true,
      description:
        `AUX F Series 1.0HP Wall Mounted Inverter. Model: ASW09A2/FLDI. ${F_SERIES_SPECS} ` +
        `Inverter technology, fast cooling, durable & reliable. ` +
        `SRP ${peso(32299)} — 20% off, now ${peso(fPrice)}. ${terms(false)}`,
    },
  });
  console.log(' ✓ AUX F Series 1.0HP (updated existing)', peso(fPrice));
  console.log('Done!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
