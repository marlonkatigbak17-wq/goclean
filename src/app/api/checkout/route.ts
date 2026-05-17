export const dynamic = 'force-dynamic';

interface LineItem {
  name: string;
  price: number;
  quantity: number;
}

export async function POST(request: Request) {
  try {
    const { items, customer, address, couponCode } = await request.json() as {
      items: LineItem[];
      customer: { name: string; email: string; phone: string };
      address: { street: string; city: string; province: string; notes: string };
      couponCode?: string;
    };

    const secretKey = process.env.PAYMONGO_SECRET_KEY;
    if (!secretKey) {
      return Response.json({ error: 'Payment not configured' }, { status: 500 });
    }

    const auth = Buffer.from(secretKey + ':').toString('base64');
    const origin = new URL(request.url).origin;

    const lineItems = items.map((item) => ({
      currency: 'PHP',
      amount: Math.round(item.price * 100),
      name: item.name,
      quantity: item.quantity,
    }));

    const body = {
      data: {
        attributes: {
          line_items: lineItems,
          payment_method_types: ['gcash', 'paymaya', 'card', 'qrph'],
          success_url: `${origin}/checkout/success`,
          cancel_url: `${origin}/checkout`,
          description: `GoClean Order — ${customer.name}`,
          billing: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
          },
          metadata: {
            address: `${address.street}, ${address.city}${address.province ? ', ' + address.province : ''}`,
            delivery_notes: address.notes || '',
            ...(couponCode ? { coupon_code: couponCode } : {}),
          },
        },
      },
    };

    const res = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('PayMongo error:', JSON.stringify(data));
      const msg = data?.errors?.[0]?.detail ?? 'Payment setup failed';
      return Response.json({ error: msg }, { status: 500 });
    }

    return Response.json({ url: data.data.attributes.checkout_url });
  } catch (e) {
    console.error('Checkout route error:', e);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
