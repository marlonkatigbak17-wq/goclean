import { NextRequest, NextResponse } from 'next/server';

const PLANS: Record<string, { amount: number; label: string }> = {
  monthly: { amount: 19900, label: 'TechPro Aircon — Monthly Premium' },
  yearly:  { amount: 149900, label: 'TechPro Aircon — Yearly Premium' },
};

export async function POST(req: NextRequest) {
  try {
    const { plan, name, phone, email } = await req.json();

    const selected = PLANS[plan];
    if (!selected) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

    const secretKey = process.env.PAYMONGO_SECRET_KEY;
    if (!secretKey) return NextResponse.json({ error: 'Payment not configured' }, { status: 500 });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://gocleanair.co';

    const payload = {
      data: {
        attributes: {
          amount: selected.amount,
          currency: 'PHP',
          description: selected.label,
          payment_method_types: ['gcash', 'card', 'paymaya'],
          success_url: `${baseUrl}/techpro/success`,
          cancel_url:  `${baseUrl}/techpro`,
          metadata: { plan, name, phone, email: email || '' },
          billing: {
            name,
            phone,
            email: email || undefined,
          },
        },
      },
    };

    const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.errors?.[0]?.detail || 'Payment creation failed' }, { status: 400 });
    }

    return NextResponse.json({ checkoutUrl: data.data.attributes.checkout_url });
  } catch (err) {
    console.error('TechPro pay error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
