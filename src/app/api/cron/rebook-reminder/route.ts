import { prisma } from '@/lib/prisma';
import { sendSms } from '@/lib/sms';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 31);
  const to = new Date(now);
  to.setDate(to.getDate() - 30);

  const bookings = await prisma.booking.findMany({
    where: {
      status: 'completed',
      rebookReminderSent: false,
      createdAt: { gte: from, lte: to },
    },
  });

  let sent = 0;
  for (const booking of bookings) {
    if (booking.phone) {
      await sendSms(
        booking.phone,
        `Hi ${booking.name}! It's been 30 days since your GoClean ${booking.service}. Time for your next aircon checkup? Book at gocleanair.co or call 0917 823 7205. - GoClean Aircon`
      );
      sent++;
    }
    await prisma.booking.update({
      where: { id: booking.id },
      data: { rebookReminderSent: true },
    });
  }

  return Response.json({ processed: bookings.length, sent });
}
