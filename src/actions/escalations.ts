"use server";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface EscalationRule {
  id: string;
  name: string;
  triggerDays: number;
  entityType: string;
  action: string;
  isActive: boolean;
}

// Default escalation rules
const DEFAULT_RULES: Omit<EscalationRule, "id">[] = [
  {
    name: "Goal Sheet Not Submitted",
    triggerDays: 14,
    entityType: "GOAL_SHEET",
    action: "NOTIFY_MANAGER",
    isActive: true,
  },
  {
    name: "Pending Approval Overdue",
    triggerDays: 7,
    entityType: "APPROVAL",
    action: "NOTIFY_ADMIN",
    isActive: true,
  },
  {
    name: "Check-in Not Completed",
    triggerDays: 21,
    entityType: "CHECK_IN",
    action: "NOTIFY_MANAGER",
    isActive: true,
  },
];

export async function getEscalations() {
  const session = await auth();
  if (!session) throw new Error("Not authenticated");

  const cycle = await prisma.cycle.findFirst({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });
  if (!cycle) return { rules: DEFAULT_RULES, escalations: [] };

  const now = new Date();
  const escalations: {
    type: string;
    employee: string;
    department: string;
    daysOverdue: number;
    action: string;
    severity: "low" | "medium" | "high";
  }[] = [];

  // Check for draft goal sheets (not submitted)
  const draftSheets = await prisma.goalSheet.findMany({
    where: { cycleId: cycle.id, status: "DRAFT" },
    include: { user: true },
  });

  draftSheets.forEach((gs: any) => {
    const daysSinceCreated = Math.floor(
      (now.getTime() - gs.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceCreated >= 14) {
      escalations.push({
        type: "Goal Sheet Not Submitted",
        employee: gs.user.name,
        department: gs.user.department,
        daysOverdue: daysSinceCreated - 14,
        action: "Notify manager to follow up",
        severity: daysSinceCreated > 28 ? "high" : daysSinceCreated > 21 ? "medium" : "low",
      });
    }
  });

  // Check for pending approvals
  const pendingApprovals = await prisma.goalSheet.findMany({
    where: { cycleId: cycle.id, status: "SUBMITTED" },
    include: { user: true },
  });

  pendingApprovals.forEach((gs: any) => {
    if (!gs.submittedAt) return;
    const daysSinceSubmit = Math.floor(
      (now.getTime() - gs.submittedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceSubmit >= 7) {
      escalations.push({
        type: "Pending Approval Overdue",
        employee: gs.user.name,
        department: gs.user.department,
        daysOverdue: daysSinceSubmit - 7,
        action: "Escalate to admin for review",
        severity: daysSinceSubmit > 14 ? "high" : "medium",
      });
    }
  });

  // Check for missing check-ins (approved sheets without recent check-in)
  const approvedSheets = await prisma.goalSheet.findMany({
    where: { cycleId: cycle.id, status: "APPROVED" },
    include: { user: true, checkIns: { orderBy: { conductedAt: "desc" } } },
  });

  const currentMonth = now.getMonth();
  const expectedQuarter =
    currentMonth < 3 ? "Q4" : currentMonth < 6 ? "Q1" : currentMonth < 9 ? "Q2" : "Q3";

  approvedSheets.forEach((gs: any) => {
    const hasCurrentQuarterCheckIn = gs.checkIns.some(
      (ci: any) => ci.quarter === expectedQuarter
    );
    if (!hasCurrentQuarterCheckIn) {
      const daysSinceQuarterStart = currentMonth % 3 * 30;
      if (daysSinceQuarterStart >= 21) {
        escalations.push({
          type: "Check-in Not Completed",
          employee: gs.user.name,
          department: gs.user.department,
          daysOverdue: daysSinceQuarterStart - 21,
          action: `${expectedQuarter} check-in pending`,
          severity: daysSinceQuarterStart > 60 ? "high" : "medium",
        });
      }
    }
  });

  return {
    rules: DEFAULT_RULES,
    escalations: escalations.sort((a, b) => {
      const sevOrder = { high: 0, medium: 1, low: 2 };
      return sevOrder[a.severity] - sevOrder[b.severity];
    }),
  };
}

export async function resolveEscalation(employeeName: string, type: string) {
  const session = await auth();
  if (!session) throw new Error("Not authenticated");

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "RESOLVED",
      entityType: "ESCALATION",
      entityId: employeeName,
      newValue: JSON.stringify({ type, resolvedBy: session.user.name }),
    },
  });

  revalidatePath("/dashboard/escalations");
  return { success: true };
}
