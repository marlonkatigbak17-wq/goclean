import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, address, position, experience, canDrive, startImmediately, resumeUrl, certUrls, coverLetter } = body;
    if (!name?.trim() || !phone?.trim() || !position?.trim())
      return Response.json({ error: 'Name, phone and position are required' }, { status: 400 });

    const app = await prisma.jobApplication.create({
      data: {
        name: name.trim(), email: email?.trim() || '', phone: phone.trim(),
        address: address?.trim() || '', position, experience: experience || '0',
        canDrive: !!canDrive, startImmediately: !!startImmediately,
        resumeUrl: resumeUrl || null, certUrls: certUrls || [],
        coverLetter: coverLetter?.trim() || '',
      },
    });

    // Notify admin via email if Resend is configured
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'GoClean Careers <onboarding@resend.dev>',
          to: ['gocleanair@gmail.com'],
          subject: `New Job Application: ${position} — ${name}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;">
            <h2 style="color:#0f1f5c;">New Job Application</h2>
            <p><strong>Position:</strong> ${position}</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Email:</strong> ${email || '—'}</p>
            <p><strong>Experience:</strong> ${experience} year(s)</p>
            <p><strong>Can Drive:</strong> ${canDrive ? 'Yes' : 'No'}</p>
            <p><strong>Start Immediately:</strong> ${startImmediately ? 'Yes' : 'No'}</p>
            ${coverLetter ? `<p><strong>Message:</strong> ${coverLetter}</p>` : ''}
            <p><a href="https://gocleanair.co/admin/careers">View in Admin Panel →</a></p>
          </div>`,
        }),
      }).catch(() => {});
    }

    return Response.json({ success: true, id: app.id });
  } catch (e) {
    console.error('Job application error:', e);
    return Response.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}
