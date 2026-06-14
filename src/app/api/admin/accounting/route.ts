import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from  = searchParams.get('from');
  const to    = searchParams.get('to');
  const type  = searchParams.get('type'); // income | expense | null = all

  const transactions = await prisma.transaction.findMany({
    where: {
      ...(type && { type }),
      ...(from || to ? {
        date: {
          ...(from && { gte: new Date(from) }),
          ...(to   && { lte: new Date(to + 'T23:59:59') }),
        },
      } : {}),
    },
    orderBy: { date: 'desc' },
  });

  const income  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return Response.json({ transactions, income, expense, profit: income - expense });
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { type, category, description, amount, date, reference, notes } = body;

  if (!type || !category || !description || !amount) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const tx = await prisma.transaction.create({
    data: {
      type,
      category,
      description,
      amount:    Number(amount),
      date:      date ? new Date(date) : new Date(),
      reference: reference || null,
      notes:     notes || '',
    },
  });

  return Response.json(tx, { status: 201 });
}
