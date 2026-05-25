import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { key, deviceId } = await req.json();

    if (!key || typeof key !== 'string') {
      return NextResponse.json({ valid: false, error: 'License key is required' }, { status: 400 });
    }

      const license = await prisma.techProLicense.findUnique({ where: { key: key.trim().toUpperCase() } });

    if (!license) {
      return NextResponse.json({ valid: false, error: 'Invalid license key' });
    }

    if (!license.isActive) {
      return NextResponse.json({ valid: false, error: 'License is inactive' });
    }

    if (license.expiresAt && license.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, error: 'License has expired', expired: true });
    }

    // Lock key to first device that activates it
    if (!license.deviceId && deviceId) {
      await prisma.techProLicense.update({
        where: { key: license.key },
        data: { deviceId },
      });
    } else if (license.deviceId && deviceId && license.deviceId !== deviceId) {
      return NextResponse.json({ valid: false, error: 'Key already activated on another device' });
    }

    return NextResponse.json({
      valid: true,
      plan: license.plan,
      expiresAt: license.expiresAt,
      name: license.name,
    });
  } catch (err) {
    console.error('TechPro verify error:', err);
    return NextResponse.json({ valid: false, error: 'Server error' }, { status: 500 });
  }
}
