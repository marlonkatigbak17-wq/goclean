import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get('slug');
  if (!slug) return Response.json({ reviews: [] });

  const reviews = await prisma.productReview.findMany({
    where: { productSlug: slug },
    orderBy: { createdAt: 'desc' },
  });

  return Response.json({ reviews });
}

export async function POST(request: Request) {
  const auth = await getAuthUser();
  if (!auth) return Response.json({ error: 'Login to leave a review' }, { status: 401 });

  const { productSlug, rating, comment } = await request.json();

  if (!productSlug || !rating || !comment) {
    return Response.json({ error: 'All fields required' }, { status: 400 });
  }

  if (rating < 1 || rating > 5) {
    return Response.json({ error: 'Rating must be 1-5' }, { status: 400 });
  }

  const existing = await prisma.productReview.findFirst({
    where: { productSlug, userId: auth.userId },
  });
  if (existing) return Response.json({ error: 'You already reviewed this product' }, { status: 409 });

  const review = await prisma.productReview.create({
    data: { productSlug, userId: auth.userId, customerName: auth.name, rating, comment },
  });

  return Response.json({ review });
}
