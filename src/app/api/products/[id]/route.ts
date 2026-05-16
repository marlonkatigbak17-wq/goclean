import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.brand !== undefined && { brand: body.brand }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.subcategory !== undefined && { subcategory: body.subcategory }),
        ...(body.price !== undefined && { price: Number(body.price) }),
        ...(body.priceWithInstallation !== undefined && {
          priceWithInstallation: body.priceWithInstallation ? Number(body.priceWithInstallation) : null,
        }),
        ...(body.specs !== undefined && { specs: body.specs }),
        ...(body.inStock !== undefined && { inStock: body.inStock }),
        ...(body.badge !== undefined && { badge: body.badge || null }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.images !== undefined && { images: body.images }),
        ...(body.slug !== undefined && { slug: body.slug }),
      },
    });

    return Response.json(product);
  } catch (e) {
    console.error('PUT /api/products error:', e);
    return Response.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (e) {
    console.error('DELETE /api/products error:', e);
    return Response.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
