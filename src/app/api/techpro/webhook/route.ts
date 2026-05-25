import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendSms } from '@/lib/sms';
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

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET_TECHPRO;

    // Verify PayMongo webhook signature
    if (webhookSecret) {
      const sigHeader = req.headers.get('paymongo-signature');
      if (sigHeader) {
        const parts = Object.fromEntries(sigHeader.split(',').map(p => p.split('=')));
        const toSign = `${parts.t}.${rawBody}`;
        const expected = crypto.createHmac('sha256', webhookSecret).update(toSign).digest('hex');
        if (parts.te !== expected && parts.li !== expected) {
          return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }
      }
    }

    const event = JSON.parse(rawBody);
    const type = event.data?.attributes?.type;

    if (type !== 'checkout_session.payment.paid') {
      return NextResponse.json({ received: true });
    }

    const session = event.data?.attributes?.data;
    const meta = session?.attributes?.metadata;
    const paymentId = session?.id;

    if (!meta?.phone || !paymentId) {
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    // Idempotency — skip if already processed
    const existing = await prisma.techProLicense.findUnique({ where: { paymentId } });
    if (existing) return NextResponse.json({ received: true });

    const plan = meta.plan || 'monthly';
    const amount = plan === 'yearly' ? 1499 : 199;
    const now = new Date();
    const expiresAt = plan === 'yearly' ? addMonths(now, 12) : addMonths(now, 1);

    const key = generateLicenseKey();

    await prisma.techProLicense.create({
      data: {
        key,
        plan,
        amount,
        phone: meta.phone,
        email: meta.email || null,
        name: meta.name || null,
        paymentId,
        activatedAt: now,
        expiresAt,
        isActive: true,
      },
    });

    // Send SMS with key
    const expiry = expiresAt.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });
    await sendSms(
      meta.phone,
      `TechPro Aircon Premium activated!\n\nYour license key:\n${key}\n\nValid until: ${expiry}\n\nOpen TechPro app > Enter Key to unlock. Keep this safe!`
    );

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('TechPro webhook error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
