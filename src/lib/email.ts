// @ts-nocheck
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = "AtmoQuest <onboarding@resend.dev>";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(options: EmailOptions) {
  if (!resend) {
    console.log("[Email Mock]", options.subject, "→", options.to);
    return { success: true, mocked: true };
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("[Email Error]", error);
    return { success: false, error };
  }
}

const baseStyles = `
  <style>
    body { font-family: 'Inter', -apple-system, sans-serif; background: #0A0D14; color: #F0F2F5; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 0 auto; padding: 40px 24px; }
    .card { background: #151921; border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 32px; }
    .logo { font-size: 20px; font-weight: 700; color: #00D4AA; text-align: center; margin-bottom: 8px; }
    .subtitle { font-size: 12px; color: #8B8FA3; text-align: center; margin-bottom: 24px; }
    h1 { font-size: 18px; font-weight: 600; margin: 0 0 8px; }
    p { font-size: 14px; color: #8B8FA3; line-height: 1.6; margin: 0 0 16px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; }
    .badge-teal { background: rgba(0,212,170,0.12); color: #00D4AA; }
    .badge-amber { background: rgba(255,181,71,0.12); color: #FFB547; }
    .badge-rose { background: rgba(255,92,138,0.12); color: #FF5C8A; }
    .badge-violet { background: rgba(124,92,252,0.12); color: #7C5CFC; }
    .table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .table th { padding: 8px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #5C6178; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .table td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .btn { display: inline-block; padding: 10px 24px; background: #00D4AA; color: #0A0D14; font-weight: 600; font-size: 14px; border-radius: 10px; text-decoration: none; }
    .footer { text-align: center; font-size: 11px; color: #5C6178; margin-top: 24px; }
  </style>
`;

function emailTemplate(title: string, body: string): string {
  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8">${baseStyles}</head>
  <body>
    <div class="container">
      <div class="card">
        <div class="logo">◈ AtmoQuest</div>
        <div class="subtitle">Goal Setting & Tracking Portal</div>
        ${body}
      </div>
      <div class="footer">
        AtomQuest Hackathon 1.0 • This is an automated notification
      </div>
    </div>
  </body>
  </html>`;
}

export async function sendGoalSubmittedEmail(data: {
  managerEmail: string;
  managerName: string;
  employeeName: string;
  goalCount: number;
  totalWeightage: number;
}) {
  const body = `
    <h1>Goal Sheet Submitted for Review</h1>
    <p>Hi ${data.managerName},</p>
    <p><strong>${data.employeeName}</strong> has submitted their goal sheet for your review.</p>
    <table class="table">
      <tr><td style="color: #5C6178;">Goals</td><td>${data.goalCount}</td></tr>
      <tr><td style="color: #5C6178;">Total Weightage</td><td>${data.totalWeightage}%</td></tr>
    </table>
    <p>Please review and approve or return the goal sheet.</p>
    <a href="${process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard/approvals" class="btn">Review Now →</a>
  `;
  return sendEmail({
    to: data.managerEmail,
    subject: `[AtmoQuest] ${data.employeeName} submitted goals for review`,
    html: emailTemplate("Goal Submitted", body),
  });
}

export async function sendGoalApprovedEmail(data: {
  employeeEmail: string;
  employeeName: string;
  managerName: string;
}) {
  const body = `
    <h1>Goal Sheet Approved! ✓</h1>
    <p>Hi ${data.employeeName},</p>
    <p>Great news! <strong>${data.managerName}</strong> has approved your goal sheet.</p>
    <p>Your goals are now locked and active. You can begin tracking achievements in the Check-ins section.</p>
    <p><span class="badge badge-teal">APPROVED</span></p>
    <a href="${process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard/goals" class="btn">View Goals →</a>
  `;
  return sendEmail({
    to: data.employeeEmail,
    subject: "[AtmoQuest] Your goal sheet has been approved!",
    html: emailTemplate("Goal Approved", body),
  });
}

export async function sendGoalReturnedEmail(data: {
  employeeEmail: string;
  employeeName: string;
  managerName: string;
  returnNote: string;
}) {
  const body = `
    <h1>Goal Sheet Returned for Rework</h1>
    <p>Hi ${data.employeeName},</p>
    <p><strong>${data.managerName}</strong> has returned your goal sheet for revisions.</p>
    <p><span class="badge badge-rose">RETURNED</span></p>
    <div style="background: #0A0D14; border-radius: 10px; padding: 16px; margin: 16px 0; border-left: 3px solid #FF5C8A;">
      <div style="font-size: 11px; color: #5C6178; margin-bottom: 4px;">Manager's Note</div>
      <div style="font-size: 14px; color: #F0F2F5;">${data.returnNote}</div>
    </div>
    <p>Please update your goals and resubmit.</p>
    <a href="${process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard/goals" class="btn">Edit Goals →</a>
  `;
  return sendEmail({
    to: data.employeeEmail,
    subject: "[AtmoQuest] Action Required: Goal sheet returned",
    html: emailTemplate("Goal Returned", body),
  });
}

export async function sendCheckInReminderEmail(data: {
  employeeEmail: string;
  employeeName: string;
  quarter: string;
  cycleName: string;
}) {
  const body = `
    <h1>${data.quarter} Check-in Reminder</h1>
    <p>Hi ${data.employeeName},</p>
    <p>It's time for your <strong>${data.quarter}</strong> quarterly check-in for <strong>${data.cycleName}</strong>.</p>
    <p>Please update your achievement progress before the window closes.</p>
    <p><span class="badge badge-violet">${data.quarter} CHECK-IN</span></p>
    <a href="${process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard/checkins" class="btn">Update Progress →</a>
  `;
  return sendEmail({
    to: data.employeeEmail,
    subject: `[AtmoQuest] ${data.quarter} Check-in Reminder — ${data.cycleName}`,
    html: emailTemplate("Check-in Reminder", body),
  });
}

export async function sendSharedGoalEmail(data: {
  employeeEmail: string;
  employeeName: string;
  goalTitle: string;
  thrustArea: string;
  assignedBy: string;
}) {
  const body = `
    <h1>Shared Goal Assigned</h1>
    <p>Hi ${data.employeeName},</p>
    <p><strong>${data.assignedBy}</strong> has assigned a shared goal to you.</p>
    <div style="background: #0A0D14; border-radius: 10px; padding: 16px; margin: 16px 0; border-left: 3px solid #7C5CFC;">
      <div style="font-size: 11px; color: #5C6178; margin-bottom: 4px;">${data.thrustArea}</div>
      <div style="font-size: 15px; font-weight: 600; color: #F0F2F5;">${data.goalTitle}</div>
    </div>
    <p>The goal has been added to your goal sheet. You can adjust the weightage but not the title or target.</p>
    <p><span class="badge badge-amber">SHARED GOAL</span></p>
    <a href="${process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard/goals" class="btn">View Goal →</a>
  `;
  return sendEmail({
    to: data.employeeEmail,
    subject: `[AtmoQuest] Shared goal: ${data.goalTitle}`,
    html: emailTemplate("Shared Goal", body),
  });
}
