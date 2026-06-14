import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const contacts = await prisma.lead.findMany({
    where: { source: 'imported' },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, phone: true, email: true, createdAt: true },
  });

  return Response.json(contacts);
}

export async function POST(request: Request) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { contacts } = await request.json();
  if (!Array.isArray(contacts) || contacts.length === 0) {
    return Response.json({ error: 'No contacts provided' }, { status: 400 });
  }

  let created = 0;
  let skipped = 0;

  for (const c of contacts) {
    const phone = String(c.phone || '').trim();
    if (!phone) { skipped++; continue; }

    const existing = await prisma.lead.findFirst({ where: { phone, source: 'imported' } });
    if (existing) { skipped++; continue; }

    await prisma.lead.create({
      data: {
        name: String(c.name || '').trim() || 'Contact',
        phone,
        email: String(c.email || '').trim(),
        source: 'imported',
        status: 'new',
      },
    });
    created++;
  }

  return Response.json({ created, skipped });
}

export async function DELETE(request: Request) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, all } = await request.json();

  if (all) {
    try {
      const { count } = await prisma.lead.deleteMany({ where: { source: 'imported' } });
      return Response.json({ deleted: count });
    } catch {
      return Response.json({ error: 'Failed to delete contacts' }, { status: 500 });
    }
  }

  if (id) {
    try {
      await prisma.lead.delete({ where: { id } });
      return Response.json({ deleted: 1 });
    } catch {
      return Response.json({ error: 'Failed to delete contact' }, { status: 500 });
    }
  }

  return Response.json({ error: 'Specify id or all' }, { status: 400 });
}
