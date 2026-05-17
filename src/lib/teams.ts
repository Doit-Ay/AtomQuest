// @ts-nocheck
/**
 * Microsoft Teams Integration
 * Sends Adaptive Card notifications via Teams Incoming Webhook
 * with deep-link support to navigate directly to goal sheets
 */

const TEAMS_WEBHOOK_URL = process.env.TEAMS_WEBHOOK_URL;
const APP_URL = process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

interface TeamsNotification {
  title: string;
  subtitle: string;
  facts: { name: string; value: string }[];
  actionUrl?: string;
  actionText?: string;
  color?: string; // Accent color for the card
}

/**
 * Send an Adaptive Card notification to Microsoft Teams
 */
async function sendTeamsCard(notification: TeamsNotification) {
  if (!TEAMS_WEBHOOK_URL) {
    console.log("[teams] Webhook not configured, skipping notification:", notification.title);
    return;
  }

  const card = {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.4",
          body: [
            {
              type: "Container",
              style: "emphasis",
              items: [
                {
                  type: "ColumnSet",
                  columns: [
                    {
                      type: "Column",
                      width: "auto",
                      items: [
                        {
                          type: "Image",
                          url: "https://img.icons8.com/fluency/48/goal.png",
                          size: "Small",
                        },
                      ],
                    },
                    {
                      type: "Column",
                      width: "stretch",
                      items: [
                        {
                          type: "TextBlock",
                          text: "AtmoQuest",
                          weight: "Bolder",
                          size: "Small",
                          color: "Accent",
                        },
                        {
                          type: "TextBlock",
                          text: notification.title,
                          weight: "Bolder",
                          size: "Medium",
                          spacing: "None",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: "Container",
              items: [
                {
                  type: "TextBlock",
                  text: notification.subtitle,
                  wrap: true,
                  spacing: "Small",
                },
                {
                  type: "FactSet",
                  facts: notification.facts,
                  spacing: "Medium",
                },
              ],
            },
          ],
          actions: notification.actionUrl
            ? [
                {
                  type: "Action.OpenUrl",
                  title: notification.actionText || "View in AtmoQuest",
                  url: notification.actionUrl,
                  style: "positive",
                },
              ]
            : [],
        },
      },
    ],
  };

  try {
    const res = await fetch(TEAMS_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(card),
    });

    if (!res.ok) {
      console.error("[teams] Webhook failed:", res.status, await res.text());
    } else {
      console.log("[teams] Notification sent:", notification.title);
    }
  } catch (error) {
    console.error("[teams] Webhook error:", error);
  }
}

// ─── Notification Functions with Deep-Links ───

/**
 * Notify manager when an employee submits their goal sheet
 */
export async function notifyTeamsGoalSubmitted({
  employeeName,
  managerName,
  department,
  goalCount,
  goalSheetId,
}: {
  employeeName: string;
  managerName: string;
  department: string;
  goalCount: number;
  goalSheetId?: string;
}) {
  await sendTeamsCard({
    title: "📋 Goal Sheet Submitted",
    subtitle: `**${employeeName}** has submitted their goal sheet for review.`,
    facts: [
      { name: "Employee", value: employeeName },
      { name: "Department", value: department },
      { name: "Goals", value: `${goalCount} goals` },
      { name: "Assigned To", value: managerName },
      { name: "Status", value: "⏳ Pending Approval" },
    ],
    actionUrl: `${APP_URL}/dashboard/approvals`,
    actionText: "Review Goal Sheet →",
  });
}

/**
 * Notify employee when their goal sheet is approved
 */
export async function notifyTeamsGoalApproved({
  employeeName,
  managerName,
  department,
}: {
  employeeName: string;
  managerName: string;
  department: string;
}) {
  await sendTeamsCard({
    title: "✅ Goal Sheet Approved",
    subtitle: `Goal sheet for **${employeeName}** has been approved by **${managerName}**.`,
    facts: [
      { name: "Employee", value: employeeName },
      { name: "Approved By", value: managerName },
      { name: "Department", value: department },
      { name: "Status", value: "✅ Approved & Locked" },
    ],
    actionUrl: `${APP_URL}/dashboard/goals`,
    actionText: "View Goals →",
  });
}

/**
 * Notify employee when their goal sheet is returned for rework
 */
export async function notifyTeamsGoalReturned({
  employeeName,
  managerName,
  comment,
}: {
  employeeName: string;
  managerName: string;
  comment?: string;
}) {
  await sendTeamsCard({
    title: "🔄 Goal Sheet Returned",
    subtitle: `Goal sheet for **${employeeName}** has been returned by **${managerName}** for revisions.`,
    facts: [
      { name: "Employee", value: employeeName },
      { name: "Returned By", value: managerName },
      { name: "Comment", value: comment || "Please review and resubmit" },
      { name: "Status", value: "🔄 Needs Revision" },
    ],
    actionUrl: `${APP_URL}/dashboard/goals`,
    actionText: "Edit Goal Sheet →",
  });
}

/**
 * Notify manager of quarterly check-in reminder
 */
export async function notifyTeamsCheckInReminder({
  managerName,
  pendingCount,
  quarter,
}: {
  managerName: string;
  pendingCount: number;
  quarter: string;
}) {
  await sendTeamsCard({
    title: "🔔 Check-in Reminder",
    subtitle: `**${managerName}**, you have **${pendingCount}** pending ${quarter} check-ins with your team.`,
    facts: [
      { name: "Manager", value: managerName },
      { name: "Quarter", value: quarter },
      { name: "Pending", value: `${pendingCount} employees` },
      { name: "Action", value: "Schedule check-ins with your team" },
    ],
    actionUrl: `${APP_URL}/dashboard/checkins`,
    actionText: "Start Check-ins →",
  });
}

/**
 * Notify about shared goal assignment
 */
export async function notifyTeamsSharedGoal({
  goalTitle,
  assignedBy,
  recipientCount,
  thrustArea,
}: {
  goalTitle: string;
  assignedBy: string;
  recipientCount: number;
  thrustArea: string;
}) {
  await sendTeamsCard({
    title: "🎯 Shared Goal Assigned",
    subtitle: `**${assignedBy}** has pushed a shared goal to **${recipientCount}** team members.`,
    facts: [
      { name: "Goal", value: goalTitle },
      { name: "Thrust Area", value: thrustArea },
      { name: "Assigned By", value: assignedBy },
      { name: "Recipients", value: `${recipientCount} employees` },
    ],
    actionUrl: `${APP_URL}/dashboard/shared-goals`,
    actionText: "View Shared Goals →",
  });
}

/**
 * Notify about escalation
 */
export async function notifyTeamsEscalation({
  type,
  employeeName,
  daysOverdue,
  severity,
}: {
  type: string;
  employeeName: string;
  daysOverdue: number;
  severity: string;
}) {
  const severityEmoji = severity === "high" ? "🔴" : severity === "medium" ? "🟡" : "🟢";
  await sendTeamsCard({
    title: `${severityEmoji} Escalation Alert`,
    subtitle: `**${type}** — ${employeeName} is **${daysOverdue} days** overdue.`,
    facts: [
      { name: "Type", value: type },
      { name: "Employee", value: employeeName },
      { name: "Days Overdue", value: `${daysOverdue} days` },
      { name: "Severity", value: `${severityEmoji} ${severity.toUpperCase()}` },
    ],
    actionUrl: `${APP_URL}/dashboard/escalations`,
    actionText: "View Escalations →",
  });
}
