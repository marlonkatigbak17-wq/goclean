import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';
    const products = await prisma.product.findMany({
      where: all ? undefined : { published: true },
      orderBy: { createdAt: 'asc' },
    });
    return Response.json(products);
  } catch (e) {
    console.error('GET /api/products error:', e);
    return Response.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    const slug = body.slug ||
      body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const product = await prisma.product.create({
      data: {
        slug,
        name: body.name,
        brand: body.brand || '',
        category: body.category || 'residential',
        subcategory: body.subcategory || 'Split Type',
        price: Number(body.price) || 0,
        priceWithInstallation: body.priceWithInstallation ? Number(body.priceWithInstallation) : null,
        images: body.images || [],
        specs: body.specs || {},
        inStock: body.inStock !== false,
        published: body.published !== false,
        badge: body.badge || null,
        description: body.description || '',
      },
    });

    return Response.json(product, { status: 201 });
  } catch (e) {
    console.error('POST /api/products error:', e);
    return Response.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
