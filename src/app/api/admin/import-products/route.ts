import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/adminAuth';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Excel file is empty' }, { status: 400 });
  }

  const results = { created: 0, updated: 0, errors: [] as string[] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    const name = row['name']?.toString().trim();
    const brand = row['brand']?.toString().trim();
    const category = row['category']?.toString().trim();
    const subcategory = row['subcategory']?.toString().trim();
    const price = parseFloat(row['price']?.toString() || '0');
    const description = row['description']?.toString().trim();

    if (!name || !brand || !category || !subcategory || !price || !description) {
      results.errors.push(`Row ${rowNum}: missing required field (name, brand, category, subcategory, price, description)`);
      continue;
    }

    const slug = row['slug']?.toString().trim() || toSlug(name);
    const priceWithInstallation = row['priceWithInstallation'] ? parseFloat(row['priceWithInstallation'].toString()) : undefined;
    const imageUrl = row['imageUrl']?.toString().trim();
    const badge = row['badge']?.toString().trim() || undefined;
    const inStock = row['inStock']?.toString().trim().toLowerCase() !== 'false';

    const specs = {
      horsepower: row['horsepower']?.toString().trim() || '',
      coolingCapacity: row['coolingCapacity']?.toString().trim() || '',
      energyEfficiency: row['energyEfficiency']?.toString().trim() || '',
      warranty: row['warranty']?.toString().trim() || '',
    };

    const data = {
      name,
      brand,
      category,
      subcategory,
      price,
      priceWithInstallation: priceWithInstallation || null,
      images: imageUrl ? [imageUrl] : [],
      specs,
      inStock,
      badge: badge || null,
      description,
    };

    try {
      const existing = await prisma.product.findUnique({ where: { slug } });
      if (existing) {
        await prisma.product.update({ where: { slug }, data });
        results.updated++;
      } else {
        await prisma.product.create({ data: { ...data, slug } });
        results.created++;
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      results.errors.push(`Row ${rowNum} (${name}): ${msg}`);
    }
  }

  return NextResponse.json(results);
}
