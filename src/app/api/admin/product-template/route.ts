import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

export async function GET() {
  const headers = [
    'name', 'brand', 'category', 'subcategory', 'price',
    'priceWithInstallation', 'horsepower', 'coolingCapacity',
    'energyEfficiency', 'warranty', 'description', 'imageUrl', 'badge', 'inStock',
  ];

  const example = {
    name: 'Daikin 1.5HP Inverter',
    brand: 'Daikin',
    category: 'residential',
    subcategory: 'Split Type',
    price: 35000,
    priceWithInstallation: 43000,
    horsepower: '1.5 HP',
    coolingCapacity: '12,000 BTU/hr',
    energyEfficiency: '5-Star Inverter',
    warranty: '5 years',
    description: 'Energy-saving inverter aircon with fast cooling technology.',
    imageUrl: '',
    badge: 'Best Seller',
    inStock: 'TRUE',
  };

  const ws = XLSX.utils.json_to_sheet([example], { header: headers });

  // Column widths
  ws['!cols'] = headers.map((h) => ({
    wch: ['description', 'name'].includes(h) ? 40 : h === 'imageUrl' ? 50 : 20,
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Products');

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new Response(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="goclean-products-template.xlsx"',
    },
  });
}
