import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['new', 'contacted', 'quoted', 'converted', 'lost'];
const VALID_SOURCES  = ['website', 'facebook', 'walk-in', 'referral', 'phone', 'import'];

export async function POST(request: Request) {
  if (!(await requireAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { leads } = await request.json();
  if (!Array.isArray(leads) || leads.length === 0)
    return Response.json({ error: 'No leads provided' }, { status: 400 });

  const valid: {
    name: string; phone: string; email: string;
    source: string; service: string; notes: string; status: string;
  }[] = [];
  let skipped = 0;

  for (const row of leads) {
    const name  = String(row.name  ?? '').trim();
    const phone = String(row.phone ?? '').trim();
    if (!name || !phone) { skipped++; continue; }

    valid.push({
      name,
      phone,
      email:   String(row.email   ?? '').trim(),
      source:  VALID_SOURCES.includes(String(row.source).toLowerCase())  ? String(row.source).toLowerCase()  : 'import',
      service: String(row.service ?? '').trim(),
      notes:   String(row.notes   ?? '').trim(),
      status:  VALID_STATUSES.includes(String(row.status).toLowerCase()) ? String(row.status).toLowerCase() : 'new',
    });
  }

  if (valid.length === 0)
    return Response.json({ error: 'No valid rows found — Name and Phone columns are required' }, { status: 400 });

  const result = await prisma.lead.createMany({ data: valid });
  return Response.json({ imported: result.count, skipped });
}
