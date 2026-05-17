import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { code, orderTotal } = await request.json();

  if (!code) return Response.json({ error: 'No code provided' }, { status: 400 });

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

  if (!coupon || !coupon.active) {
    return Response.json({ error: 'Invalid or expired coupon code' }, { status: 404 });
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return Response.json({ error: 'This coupon has reached its usage limit' }, { status: 400 });
  }

  if (orderTotal < coupon.minOrder) {
    return Response.json({ error: `Minimum order of ₱${coupon.minOrder.toLocaleString()} required` }, { status: 400 });
  }

  const discountAmount = coupon.discountType === 'percentage'
    ? Math.round(orderTotal * (coupon.discountValue / 100))
    : Math.min(coupon.discountValue, orderTotal);

  return Response.json({
    valid: true,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount,
  });
}
