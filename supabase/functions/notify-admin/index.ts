// supabase/functions/notify-admin/index.ts
//
// Deployed manually via the Supabase dashboard's Edge Functions editor —
// this file is kept in the repo for version control/reference only.
//
// Triggered by Supabase Database Webhooks, all pointed at this same function URL:
//   - INSERT on public.lesson_enrollments        -> admin notified of new enrollment
//   - INSERT on public.volunteer_applications     -> admin notified of new application
//   - UPDATE on public.lesson_enrollments         -> parent notified on Pending->Accepted/Rejected
//   - UPDATE on public.volunteer_applications     -> volunteer notified on *->Approved/Denied
//   - INSERT on public.matches                    -> parent + volunteer notified of the match
//   - INSERT on public.slot_requests              -> teacher notified of a new lesson-time request
//   - UPDATE on public.slot_requests              -> student/parent notified on Pending->Accepted
//
// Sends via Resend from the verified melodymission.com domain.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;

const FROM_ADDRESS = 'Melody Mission <hello@melodymission.com>';

type WebhookPayload = {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: Record<string, unknown> | null;
  old_record: Record<string, unknown> | null;
};

type EmailJob = { to: string[]; subject: string; html: string };

function str(record: Record<string, unknown>, key: string, fallback = ''): string {
  const value = record[key];
  return value == null ? fallback : String(value);
}

async function getAdminRecipients(
  supabase: ReturnType<typeof createClient>
): Promise<string[]> {
  const { data, error } = await supabase.from('admin_emails').select('email');
  if (error) {
    console.error('notify: failed to load admin_emails', error);
    return [];
  }
  return (data ?? []).map((a: { email: string }) => a.email).filter(Boolean);
}

function buildAdminEnrollmentEmail(record: Record<string, unknown>): Omit<EmailJob, 'to'> {
  const childName = str(record, 'child_name', 'Unknown');
  const childAge = record.child_age ?? 'unknown';
  const parentName = str(record, 'parent_name', 'Unknown');
  const parentEmail = str(record, 'parent_email', 'unknown');
  const instrument = str(record, 'instrument_interest').trim();
  const notes = str(record, 'notes').trim();

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

function buildAdminVolunteerEmail(record: Record<string, unknown>) {
  const fullName = str(record, 'full_name', 'Unknown');
  const email = str(record, 'email', 'unknown');
  const phone = str(record, 'phone').trim();
  const specialty = str(record, 'instrument_specialty', 'Not specified');
  const experienceYears = record.experience_years ?? 'unknown';
  const teachingExperience = str(record, 'teaching_experience').trim();
  const bio = str(record, 'bio').trim();

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

function buildParentEnrollmentStatusEmail(record: Record<string, unknown>, status: string): EmailJob {
  const childName = str(record, 'child_name', 'your child');
  const parentEmail = str(record, 'parent_email');
  const parentName = str(record, 'parent_name');
  const accepted = status === 'Accepted';

  const subject = accepted ? `Great news about ${childName}'s enrollment` : `Update on ${childName}'s enrollment`;
  const html = `
    <div style="font-family: Arial, sans-serif; font-size: 15px; color: #1f2937; line-height: 1.5;">
      <h2 style="margin: 0 0 12px;">${accepted ? 'Enrollment accepted' : 'Enrollment update'}</h2>
      <p>Hi ${parentName || 'there'},</p>
      ${accepted
        ? `<p><strong>${childName}</strong>'s enrollment has been accepted. We'll be in touch soon once we match ${childName} with a volunteer teacher.</p>`
        : `<p>We're sorry to let you know that we're unable to move forward with <strong>${childName}</strong>'s enrollment at this time.</p>`}
    </div>
  `;
  return { to: parentEmail ? [parentEmail] : [], subject, html };
}

function buildVolunteerStatusEmail(record: Record<string, unknown>, status: string): EmailJob {
  const fullName = str(record, 'full_name');
  const email = str(record, 'email');
  const approved = status === 'Approved';

  const subject = approved ? 'Your volunteer application has been approved!' : 'Update on your volunteer application';
  const html = `
    <div style="font-family: Arial, sans-serif; font-size: 15px; color: #1f2937; line-height: 1.5;">
      <h2 style="margin: 0 0 12px;">${approved ? 'Application approved' : 'Application update'}</h2>
      <p>Hi ${fullName || 'there'},</p>
      ${approved
        ? `<p>Congratulations, your volunteer application has been approved. Log in to the portal to complete training and set your teaching availability.</p>`
        : `<p>Thank you for your interest in volunteering with Melody Mission. We're unable to move forward with your application at this time.</p>`}
    </div>
  `;
  return { to: email ? [email] : [], subject, html };
}

async function buildMatchCreatedJobs(
  record: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>
): Promise<EmailJob[] | null> {
  const volunteerId = record.volunteer_id as string | undefined;
  const enrollmentId = record.enrollment_id as string | undefined;
  if (!volunteerId || !enrollmentId) return null;

  const [{ data: volunteer }, { data: enrollment }] = await Promise.all([
    supabase.from('volunteer_applications').select('full_name, email').eq('id', volunteerId).maybeSingle(),
    supabase.from('lesson_enrollments').select('child_name, parent_name, parent_email').eq('id', enrollmentId).maybeSingle(),
  ]);

  if (!volunteer || !enrollment) {
    console.warn('notify: match created but volunteer/enrollment lookup failed', { volunteerId, enrollmentId });
    return null;
  }

  const childName = String(enrollment.child_name ?? 'your student');
  const volunteerName = String(volunteer.full_name ?? 'your volunteer teacher');

  const jobs: EmailJob[] = [];
  if (enrollment.parent_email) {
    jobs.push({
      to: [String(enrollment.parent_email)],
      subject: `${childName} has been matched with a teacher!`,
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 15px; color: #1f2937; line-height: 1.5;">
          <h2 style="margin: 0 0 12px;">You've been matched!</h2>
          <p>Hi ${String(enrollment.parent_name ?? 'there')},</p>
          <p><strong>${childName}</strong> has been matched with volunteer teacher <strong>${volunteerName}</strong>. Log in to the portal to see the teacher's available lesson times and request a slot.</p>
        </div>
      `,
    });
  }
  if (volunteer.email) {
    jobs.push({
      to: [String(volunteer.email)],
      subject: `You've been matched with a student!`,
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 15px; color: #1f2937; line-height: 1.5;">
          <h2 style="margin: 0 0 12px;">You've been matched!</h2>
          <p>Hi ${volunteerName},</p>
          <p>You've been matched with student <strong>${childName}</strong>. Log in to the portal to see their profile and hear from them once they request a lesson time.</p>
        </div>
      `,
    });
  }
  return jobs.length ? jobs : null;
}

async function buildSlotRequestedJobs(
  record: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>
): Promise<EmailJob[] | null> {
  const slotId = record.slot_id as string | undefined;
  if (!slotId) return null;

  const { data: slot } = await supabase
    .from('volunteer_availability')
    .select('volunteer_name, volunteer_email, day_of_week, start_time, end_time')
    .eq('id', slotId)
    .maybeSingle();

  if (!slot?.volunteer_email) return null;

  const studentName = str(record, 'student_name', 'A student');
  const notes = str(record, 'notes').trim();

  return [{
    to: [String(slot.volunteer_email)],
    subject: `New lesson time request from ${studentName}`,
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 15px; color: #1f2937; line-height: 1.5;">
        <h2 style="margin: 0 0 12px;">New lesson time request</h2>
        <p>Hi ${String(slot.volunteer_name ?? 'there')},</p>
        <p><strong>${studentName}</strong> has requested your ${String(slot.day_of_week ?? '')} ${String(slot.start_time ?? '')}–${String(slot.end_time ?? '')} slot.</p>
        ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
        <p>Log in to the portal to accept or decline this request.</p>
      </div>
    `,
  }];
}

function buildSlotRequestAcceptedEmail(record: Record<string, unknown>): EmailJob {
  const studentEmail = str(record, 'student_email');
  const studentName = str(record, 'student_name', 'there');
  return {
    to: studentEmail ? [studentEmail] : [],
    subject: 'Your lesson time request was accepted',
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 15px; color: #1f2937; line-height: 1.5;">
        <h2 style="margin: 0 0 12px;">Request accepted</h2>
        <p>Hi ${studentName},</p>
        <p>Your requested lesson time has been accepted by your teacher. Log in to the portal for the details.</p>
      </div>
    `,
  };
}

async function resolveJobs(
  payload: WebhookPayload,
  supabase: ReturnType<typeof createClient>
): Promise<EmailJob[] | null> {
  const { table, type, record, old_record } = payload;
  if (!record) return null;

  if (type === 'INSERT') {
    if (table === 'lesson_enrollments') {
      const admins = await getAdminRecipients(supabase);
      if (!admins.length) return null;
      return [{ to: admins, ...buildAdminEnrollmentEmail(record) }];
    }
    if (table === 'volunteer_applications') {
      const admins = await getAdminRecipients(supabase);
      if (!admins.length) return null;
      return [{ to: admins, ...buildAdminVolunteerEmail(record) }];
    }
    if (table === 'matches') {
      return buildMatchCreatedJobs(record, supabase);
    }
    if (table === 'slot_requests') {
      return buildSlotRequestedJobs(record, supabase);
    }
    return null;
  }

  if (type === 'UPDATE') {
    if (!old_record) return null;
    const oldStatus = str(old_record, 'status');
    const newStatus = str(record, 'status');
    if (!newStatus || oldStatus === newStatus) return null;

    if (table === 'lesson_enrollments') {
      if (oldStatus === 'Pending' && (newStatus === 'Accepted' || newStatus === 'Rejected')) {
        return [buildParentEnrollmentStatusEmail(record, newStatus)];
      }
      return null;
    }
    if (table === 'volunteer_applications') {
      if (newStatus === 'Approved' || newStatus === 'Denied') {
        return [buildVolunteerStatusEmail(record, newStatus)];
      }
      return null;
    }
    if (table === 'slot_requests') {
      if (oldStatus === 'Pending' && newStatus === 'Accepted') {
        return [buildSlotRequestAcceptedEmail(record)];
      }
      return null;
    }
    return null;
  }

  return null;
}

async function sendEmail(to: string[], subject: string, html: string): Promise<void> {
  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_ADDRESS, to, subject, html }),
  });

  if (!resendResponse.ok) {
    const errBody = await resendResponse.text();
    throw new Error(`Resend API error ${resendResponse.status}: ${errBody}`);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch (err) {
    console.error('notify: failed to parse JSON body', err);
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), { status: 400 });
  }

  if (payload.type !== 'INSERT' && payload.type !== 'UPDATE') {
    return new Response(JSON.stringify({ skipped: true }), { status: 200 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  let jobs: EmailJob[] | null;
  try {
    jobs = await resolveJobs(payload, supabase);
  } catch (err) {
    console.error('notify: failed to resolve notification jobs', err);
    return new Response(JSON.stringify({ error: 'Failed to resolve notification jobs' }), { status: 500 });
  }

  if (!jobs || jobs.length === 0) {
    return new Response(JSON.stringify({ skipped: true }), { status: 200 });
  }

  let sent = 0;
  for (const job of jobs) {
    const recipients = job.to.filter(Boolean);
    if (recipients.length === 0) {
      console.warn(`notify: no recipients for "${job.subject}", skipping`);
      continue;
    }
    try {
      await sendEmail(recipients, job.subject, job.html);
      sent += 1;
    } catch (err) {
      console.error(`notify: failed to send "${job.subject}"`, err);
    }
  }

  return new Response(JSON.stringify({ sent, jobs: jobs.length }), { status: 200 });
});
