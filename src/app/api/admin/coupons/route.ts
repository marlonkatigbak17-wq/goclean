import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  return Response.json({ coupons });
}

export async function POST(request: Request) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { code, discountType, discountValue, minOrder, maxUses } = await request.json();

  if (!code || !discountValue) {
    return Response.json({ error: 'Code and discount value are required' }, { status: 400 });
  }

  const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (existing) return Response.json({ error: 'Code already exists' }, { status: 409 });

  const coupon = await prisma.coupon.create({
    data: {
      code: code.toUpperCase(),
      discountType: discountType || 'percentage',
      discountValue: parseFloat(discountValue),
      minOrder: parseFloat(minOrder) || 0,
      maxUses: maxUses ? parseInt(maxUses) : null,
    },
  });

  return Response.json({ coupon });
}
