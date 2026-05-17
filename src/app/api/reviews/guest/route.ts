import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { productSlug, customerName, rating, comment } = await request.json();

  if (!productSlug || !customerName?.trim() || !comment?.trim()) {
    return Response.json({ error: 'All fields are required' }, { status: 400 });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return Response.json({ error: 'Rating must be 1–5' }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { slug: productSlug } });
  if (!product) return Response.json({ error: 'Product not found' }, { status: 404 });

  const review = await prisma.productReview.create({
    data: {
      productSlug,
      customerName: customerName.trim(),
      rating,
      comment: comment.trim(),
    },
  });

  return Response.json({ review });
}
