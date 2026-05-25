import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import crypto from 'crypto';

function generateLicenseKey(): string {
  const seg = () => crypto.randomBytes(2).toString('hex').toUpperCase();
  return `TECH-${seg()}-${seg()}-${seg()}`;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

// GET — list all licenses
export async function GET() {
  const prisma = getPrisma();
  const licenses = await prisma.techProLicense.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(licenses);
}

// POST — manually create a license key
export async function POST(req: NextRequest) {
  const { plan, phone, name, email } = await req.json();
  const prisma = getPrisma();
  const now = new Date();
  const key = generateLicenseKey();
  const expiresAt = plan === 'yearly' ? addMonths(now, 12) : addMonths(now, 1);

  const license = await prisma.techProLicense.create({
    data: {
      key,
      plan: plan || 'monthly',
      amount: plan === 'yearly' ? 1499 : 199,
      phone,
      name: name || null,
      email: email || null,
      activatedAt: now,
      expiresAt,
      isActive: true,
    },
  });
  return NextResponse.json(license);
}

// PATCH — toggle active/inactive
export async function PATCH(req: NextRequest) {
  const { id, isActive } = await req.json();
  const prisma = getPrisma();
  const updated = await prisma.techProLicense.update({
    where: { id },
    data: { isActive },
  });
  return NextResponse.json(updated);
}
