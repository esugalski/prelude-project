// supabase/functions/notify-admin/index.ts
//
// Triggered by Supabase Database Webhooks on INSERT into:
//   - public.lesson_enrollments   (fires once per new child row)
//   - public.volunteer_applications
//
// Sends one notification email (via Resend) to every address currently
// listed in public.admin_emails.
//
// Deployed manually via the Supabase dashboard's Edge Functions editor —
// this file is kept in the repo for version control/reference only.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;

// TODO once you verify your own domain in Resend: change this line only.
const FROM_ADDRESS = 'Melody Mission <onboarding@resend.dev>';

type WebhookPayload = {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: Record<string, unknown> | null;
  old_record: Record<string, unknown> | null;
};

type EmailContent = { subject: string; html: string };

function buildEnrollmentEmail(record: Record<string, unknown>): EmailContent {
  const childName = String(record.child_name ?? 'Unknown');
  const childAge = record.child_age ?? 'unknown';
  const parentName = String(record.parent_name ?? 'Unknown');
  const parentEmail = String(record.parent_email ?? 'unknown');
  const instrument = String(record.instrument_interest ?? '').trim();
  const notes = String(record.notes ?? '').trim();

  const subject = `New student enrollment: ${childName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; font-size: 15px; color: #1f2937; line-height: 1.5;">
      <h2 style="margin: 0 0 12px;">New Lesson Enrollment</h2>
      <p>A new student has enrolled and is waiting to be matched with a volunteer.</p>
      <table style="border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Child</td><td>${childName} (age ${childAge})</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Instrument interest</td><td>${instrument || 'Not specified'}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Parent</td><td>${parentName} (${parentEmail})</td></tr>
        ${notes ? `<tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Notes</td><td>${notes}</td></tr>` : ''}
      </table>
      <p>Log in to the admin portal to review and match this student with a volunteer.</p>
    </div>
  `;
  return { subject, html };
}

function buildVolunteerEmail(record: Record<string, unknown>): EmailContent {
  const fullName = String(record.full_name ?? 'Unknown');
  const email = String(record.email ?? 'unknown');
  const phone = String(record.phone ?? '').trim();
  const specialty = String(record.instrument_specialty ?? 'Not specified');
  const experienceYears = record.experience_years ?? 'unknown';
  const teachingExperience = String(record.teaching_experience ?? '').trim();
  const bio = String(record.bio ?? '').trim();

  const subject = `New volunteer application: ${fullName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; font-size: 15px; color: #1f2937; line-height: 1.5;">
      <h2 style="margin: 0 0 12px;">New Volunteer Application</h2>
      <p>A new volunteer has applied and is waiting for review.</p>
      <table style="border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Name</td><td>${fullName}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Contact</td><td>${email}${phone ? ` / ${phone}` : ''}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Instrument specialty</td><td>${specialty}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Experience</td><td>${experienceYears} years</td></tr>
        ${teachingExperience ? `<tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Teaching experience</td><td>${teachingExperience}</td></tr>` : ''}
        ${bio ? `<tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Bio</td><td>${bio}</td></tr>` : ''}
      </table>
      <p>Log in to the admin portal to review this application.</p>
    </div>
  `;
  return { subject, html };
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch (err) {
    console.error('notify-admin: failed to parse JSON body', err);
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), { status: 400 });
  }

  if (payload.type !== 'INSERT' || !payload.record) {
    return new Response(JSON.stringify({ skipped: true }), { status: 200 });
  }

  let content: EmailContent;
  if (payload.table === 'lesson_enrollments') {
    content = buildEnrollmentEmail(payload.record);
  } else if (payload.table === 'volunteer_applications') {
    content = buildVolunteerEmail(payload.record);
  } else {
    console.warn(`notify-admin: unrecognized table "${payload.table}", skipping`);
    return new Response(JSON.stringify({ skipped: true, reason: 'unrecognized table' }), { status: 200 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { data: admins, error: adminsError } = await supabase
    .from('admin_emails')
    .select('email');

  if (adminsError) {
    console.error('notify-admin: failed to load admin_emails', adminsError);
    return new Response(JSON.stringify({ error: 'Failed to load admin_emails' }), { status: 500 });
  }

  const recipients = (admins ?? []).map((a) => a.email).filter(Boolean);
  if (recipients.length === 0) {
    console.warn('notify-admin: admin_emails table is empty, nothing to send');
    return new Response(JSON.stringify({ skipped: true, reason: 'no admin recipients' }), { status: 200 });
  }

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: recipients,
        subject: content.subject,
        html: content.html,
      }),
    });

    if (!resendResponse.ok) {
      const errBody = await resendResponse.text();
      console.error(`notify-admin: Resend API error ${resendResponse.status}: ${errBody}`);
      return new Response(JSON.stringify({ error: 'Resend API error', detail: errBody }), { status: 502 });
    }

    return new Response(JSON.stringify({ sent: true, recipients: recipients.length }), { status: 200 });
  } catch (err) {
    console.error('notify-admin: unexpected error sending email', err);
    return new Response(JSON.stringify({ error: 'Unexpected error sending email' }), { status: 500 });
  }
});
