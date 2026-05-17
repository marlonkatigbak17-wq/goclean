import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const inventory = [
  { name: 'Daikin 1.5HP Inverter Split Type', sku: 'DAI-1.5-INV', stock: 5, minStock: 2 },
  { name: 'Carrier 1HP Standard Split Type', sku: 'CAR-1HP-STD', stock: 3, minStock: 2 },
  { name: 'Midea 2HP Inverter Split Type', sku: 'MID-2HP-INV', stock: 2, minStock: 2 },
  { name: 'Panasonic 1HP Window Type', sku: 'PAN-1HP-WIN', stock: 4, minStock: 2 },
  { name: 'LG 1.5HP Dual Inverter', sku: 'LG-1.5-DUAL', stock: 2, minStock: 2 },
  { name: 'Daikin 2.5HP Cassette Type', sku: 'DAI-2.5-CAS', stock: 1, minStock: 1 },
  { name: 'Copper Tube 1/4" ×50ft', sku: 'COP-025-50', stock: 3, minStock: 5 },
  { name: 'R-410A Refrigerant 10kg', sku: 'REF-410A-10', stock: 1, minStock: 3 },
  { name: 'Two-Stage Vacuum Pump 3CFM', sku: 'VAC-3CFM-2S', stock: 2, minStock: 1 },
];

export async function POST() {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return Response.json({ error: 'Email not configured' }, { status: 500 });

  const lowItems = inventory.filter((i) => i.stock <= i.minStock);
  if (lowItems.length === 0) return Response.json({ message: 'No low stock items' });

  const rows = lowItems.map((i) =>
    `<tr style="border-bottom:1px solid #e5e7eb;">
      <td style="padding:8px 12px;font-weight:600;color:#111;">${i.name}</td>
      <td style="padding:8px 12px;font-family:monospace;color:#555;">${i.sku}</td>
      <td style="padding:8px 12px;color:#dc2626;font-weight:700;">${i.stock}</td>
      <td style="padding:8px 12px;color:#555;">${i.minStock}</td>
    </tr>`
  ).join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#0f1f5c;padding:20px 24px;border-radius:8px 8px 0 0;">
        <h1 style="color:white;margin:0;font-size:18px;">⚠️ Low Stock Alert — GoClean Inventory</h1>
      </div>
      <div style="padding:20px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
        <p style="color:#555;font-size:14px;">${lowItems.length} item(s) are at or below minimum stock level:</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead><tr style="background:#f3f4f6;">
            <th style="padding:8px 12px;text-align:left;color:#555;">Item</th>
            <th style="padding:8px 12px;text-align:left;color:#555;">SKU</th>
            <th style="padding:8px 12px;text-align:left;color:#dc2626;">Stock</th>
            <th style="padding:8px 12px;text-align:left;color:#555;">Min</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="margin-top:16px;font-size:13px;color:#555;">Please reorder these items soon to avoid stockouts.</p>
      </div>
    </div>`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'GoClean Inventory <onboarding@resend.dev>',
      to: ['gocleanair@gmail.com'],
      subject: `⚠️ Low Stock Alert — ${lowItems.length} item(s) need reorder`,
      html,
    }),
  });

  return Response.json({ sent: true, count: lowItems.length });
}
