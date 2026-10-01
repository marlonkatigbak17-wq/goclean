// Publishes Daikin D-Smart and Amihan units at the 20% discount price list.
// These products already existed as drafts with full specs — this updates them in place.
// DR price, pickup at warehouse — installation not included.
// Run: node --env-file=.env scripts/add-daikin-products.mjs
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const BLOB = 'https://raxvmgujbgiemzpm.public.blob.vercel-storage.com/products';

const series = [
  {
    slugPrefix: 'daikin-d-smart', image: `${BLOB}/daikin-d-smart-fpTBVfQ3NeV9nCsPPHbtWFgaf49fss.jpg`,
    units: [
      ['0.8', 35200, 28160],
      ['1.0', 39700, 31760],
      ['1.5', 44600, 35680],
      ['2.0', 58200, 46560],
      ['2.5', 67400, 53920],
      ['3.0', 94000, 75200],
    ],
  },
  {
    slugPrefix: 'daikin-amihan', image: `${BLOB}/daikin-amihan-gVVKyow5OfNGMeDtC0033Khi4IYDY3.jpg`,
    units: [
      ['0.8', 32400, 25920],
      ['1.0', 35300, 28240],
      ['1.5', 37500, 30000],
      ['2.0', 53700, 42960],
    ],
  },
  {
    // No photo yet — keeps whatever image the product already has.
    slugPrefix: 'daikin-d-smart-king', image: null,
    units: [
      ['1.0', 63800, 51040],
      ['1.5', 70500, 56400],
      ['2.0', 90200, 72160],
      ['2.5', 104900, 83920],
      ['3.0', 141400, 113120],
    ],
  },
  {
    slugPrefix: 'daikin-d-smart-queen', image: null,
    units: [
      ['1.0', 49500, 39600],
      ['1.5', 55500, 44400],
      ['2.0', 71200, 56960],
      ['2.5', 82700, 66160],
      ['3.0', 115300, 92240],
    ],
  },
];

const peso = (n) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2 })}`;

// Marks where the sale terms start, so re-running replaces them instead of appending again.
const TERMS_MARKER = ' SRP ₱';

async function main() {
  for (const s of series) {
    for (const [hp, srp, price] of s.units) {
      const slug = `${s.slugPrefix}-${hp.replace('.', '-')}hp`;
      const existing = await prisma.product.findUnique({ where: { slug } });
      if (!existing) {
        console.log(' ✗ missing', slug);
        continue;
      }
      const base = existing.description.split(TERMS_MARKER)[0].trim();
      await prisma.product.update({
        where: { slug },
        data: {
          price,
          priceWithInstallation: null,
          images: s.image ? [s.image] : existing.images,
          subcategory: 'Wall Mounted',
          specs: { ...existing.specs, warranty: 'With parts warranty' },
          inStock: true,
          published: true,
          badge: 'Sale',
          description:
            `${base}${TERMS_MARKER}${srp.toLocaleString('en-PH')} — 20% off, now ${peso(price)}. ` +
            `DR price — installation not included. Pickup at warehouse. With parts warranty.`,
        },
      });
      console.log(' ✓', existing.name, peso(price));
    }
  }
  console.log('Done!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
