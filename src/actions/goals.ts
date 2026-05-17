// @ts-nocheck
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  sendGoalSubmittedEmail,
  sendGoalApprovedEmail,
  sendGoalReturnedEmail,
} from "@/lib/email";

export async function getGoalSheetForUser(userId: string, cycleId?: string) {
  const cycle =
    cycleId
      ? await prisma.cycle.findUnique({ where: { id: cycleId } })
      : await prisma.cycle.findFirst({
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
        });

  if (!cycle) return null;

  const goalSheet = await prisma.goalSheet.findUnique({
    where: { userId_cycleId: { userId, cycleId: cycle.id } },
    include: {
      goals: { orderBy: { sortOrder: "asc" }, include: { achievements: true } },
      checkIns: { include: { manager: true } },
      user: true,
      cycle: true,
    },
  });

  return goalSheet;
}

export async function createGoal(data: {
  goalSheetId: string;
  thrustArea: string;
  title: string;
  description: string;
  uom: string;
  target: number;
  targetDate?: string;
  weightage: number;
}) {
  const session = await auth();
  if (!session) throw new Error("Not authenticated");

  // Check goal count
  const existingGoals = await prisma.goal.count({
    where: { goalSheetId: data.goalSheetId },
  });

  if (existingGoals >= 8) {
    throw new Error("Maximum 8 goals allowed per goal sheet");
  }

  // Check weightage
  const totalWeightage = await prisma.goal.aggregate({
    where: { goalSheetId: data.goalSheetId },
    _sum: { weightage: true },
  });

  if ((totalWeightage._sum.weightage || 0) + data.weightage > 100) {
    throw new Error("Total weightage cannot exceed 100%");
  }

  if (data.weightage < 10) {
    throw new Error("Minimum weightage per goal is 10%");
  }

  const goal = await prisma.goal.create({
    data: {
      goalSheetId: data.goalSheetId,
      thrustArea: data.thrustArea,
      title: data.title,
      description: data.description,
      uom: data.uom,
      target: data.target,
      targetDate: data.targetDate ? new Date(data.targetDate) : null,
      weightage: data.weightage,
      sortOrder: existingGoals,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CREATED",
      entityType: "GOAL",
      entityId: goal.id,
      newValue: JSON.stringify(data),
    },
  });

  revalidatePath("/dashboard/goals");
  return goal;
}

export async function updateGoal(
  goalId: string,
  data: Partial<{
    thrustArea: string;
    title: string;
    description: string;
    uom: string;
    target: number;
    targetDate: string;
    weightage: number;
    status: string;
  }>
) {
  const session = await auth();
  if (!session) throw new Error("Not authenticated");

  const existing = await prisma.goal.findUnique({
    where: { id: goalId },
    include: { goalSheet: true },
  });

  if (!existing) throw new Error("Goal not found");

  if (existing.goalSheet.isLocked && session.user.role !== "ADMIN") {
    throw new Error("Goal sheet is locked");
  }

  const goal = await prisma.goal.update({
    where: { id: goalId },
    data: {
      ...data,
      targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATED",
      entityType: "GOAL",
      entityId: goal.id,
      previousValue: JSON.stringify(existing),
      newValue: JSON.stringify(data),
    },
  });

  revalidatePath("/dashboard/goals");
  revalidatePath("/dashboard/approvals");
  return goal;
}

export async function deleteGoal(goalId: string) {
  const session = await auth();
  if (!session) throw new Error("Not authenticated");

  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    include: { goalSheet: true },
  });

  if (!goal) throw new Error("Goal not found");
  if (goal.goalSheet.isLocked) throw new Error("Goal sheet is locked");

  await prisma.goal.delete({ where: { id: goalId } });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "DELETED",
      entityType: "GOAL",
      entityId: goalId,
      previousValue: JSON.stringify(goal),
    },
  });

  revalidatePath("/dashboard/goals");
}

export async function ensureGoalSheet() {
  const session = await auth();
  if (!session) throw new Error("Not authenticated");

  const cycle = await prisma.cycle.findFirst({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  if (!cycle) throw new Error("No active cycle found");

  let goalSheet = await prisma.goalSheet.findUnique({
    where: { userId_cycleId: { userId: session.user.id, cycleId: cycle.id } },
  });

  if (!goalSheet) {
    goalSheet = await prisma.goalSheet.create({
      data: {
        userId: session.user.id,
        cycleId: cycle.id,
        status: "DRAFT",
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATED",
        entityType: "GOAL_SHEET",
        entityId: goalSheet.id,
        newValue: JSON.stringify({ status: "DRAFT" }),
      },
    });
  }

  return goalSheet;
}

export async function submitGoalSheet(goalSheetId: string) {
  const session = await auth();
  if (!session) throw new Error("Not authenticated");

  const goalSheet = await prisma.goalSheet.findUnique({
    where: { id: goalSheetId },
    include: { goals: true },
  });

  if (!goalSheet) throw new Error("Goal sheet not found");

  // Validate total weightage
  const total = goalSheet.goals.reduce((sum, g) => sum + g.weightage, 0);
  if (Math.abs(total - 100) > 0.01) {
    throw new Error(`Total weightage must be 100%. Current: ${total}%`);
  }

  const updated = await prisma.goalSheet.update({
    where: { id: goalSheetId },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATED",
      entityType: "GOAL_SHEET",
      entityId: goalSheetId,
      previousValue: JSON.stringify({ status: goalSheet.status }),
      newValue: JSON.stringify({ status: "SUBMITTED" }),
    },
  });

  // Send email to manager
  const employee = await prisma.user.findUnique({ where: { id: session.user.id }, include: { manager: true } });
  if (employee?.manager) {
    await sendGoalSubmittedEmail({
      managerEmail: employee.manager.email,
      managerName: employee.manager.name,
      employeeName: employee.name,
      goalCount: goalSheet.goals.length,
      totalWeightage: total,
    });
  }

  revalidatePath("/dashboard/goals");
  revalidatePath("/dashboard/approvals");
  return updated;
}

export async function approveGoalSheet(goalSheetId: string) {
  const session = await auth();
  if (!session) throw new Error("Not authenticated");

  const updated = await prisma.goalSheet.update({
    where: { id: goalSheetId },
    data: {
      status: "APPROVED",
      approvedAt: new Date(),
      isLocked: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "APPROVED",
      entityType: "GOAL_SHEET",
      entityId: goalSheetId,
      previousValue: JSON.stringify({ status: "SUBMITTED" }),
      newValue: JSON.stringify({ status: "APPROVED" }),
    },
  });

  // Send approval email to employee
  const approvedSheet = await prisma.goalSheet.findUnique({
    where: { id: goalSheetId },
    include: { user: true },
  });
  if (approvedSheet?.user) {
    await sendGoalApprovedEmail({
      employeeEmail: approvedSheet.user.email,
      employeeName: approvedSheet.user.name,
      managerName: session.user.name || "Manager",
    });
  }

  revalidatePath("/dashboard/approvals");
  revalidatePath("/dashboard/goals");
  return updated;
}

export async function returnGoalSheet(goalSheetId: string, note: string) {
  const session = await auth();
  if (!session) throw new Error("Not authenticated");

  const updated = await prisma.goalSheet.update({
    where: { id: goalSheetId },
    data: {
      status: "RETURNED",
      returnedAt: new Date(),
      returnNote: note,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "RETURNED",
      entityType: "GOAL_SHEET",
      entityId: goalSheetId,
      previousValue: JSON.stringify({ status: "SUBMITTED" }),
      newValue: JSON.stringify({ status: "RETURNED", returnNote: note }),
    },
  });

  // Send return email to employee
  const returnedSheet = await prisma.goalSheet.findUnique({
    where: { id: goalSheetId },
    include: { user: true },
  });
  if (returnedSheet?.user) {
    await sendGoalReturnedEmail({
      employeeEmail: returnedSheet.user.email,
      employeeName: returnedSheet.user.name,
      managerName: session.user.name || "Manager",
      returnNote: note,
    });
  }

  revalidatePath("/dashboard/approvals");
  return updated;
}

export async function updateAchievement(data: {
  goalId: string;
  quarter: string;
  actualValue: number;
  status?: string;
}) {
  const session = await auth();
  if (!session) throw new Error("Not authenticated");

  const goal = await prisma.goal.findUnique({ where: { id: data.goalId } });
  if (!goal) throw new Error("Goal not found");

  // Compute score
  let score = 0;
  const uom = goal.uom;
  const target = goal.target;
  const actual = data.actualValue;

  switch (uom) {
    case "NUMERIC_MIN":
    case "PERCENTAGE_MIN":
      score = target > 0 ? Math.min((actual / target) * 100, 150) : 0;
      break;
    case "NUMERIC_MAX":
    case "PERCENTAGE_MAX":
      score = actual > 0 ? Math.min((target / actual) * 100, 150) : 100;
      break;
    case "ZERO":
      score = actual === 0 ? 100 : 0;
      break;
    case "TIMELINE":
      score = actual <= target ? 100 : 0;
      break;
  }

  const achievement = await prisma.achievement.upsert({
    where: { goalId_quarter: { goalId: data.goalId, quarter: data.quarter } },
    update: { actualValue: data.actualValue, score },
    create: {
      goalId: data.goalId,
      quarter: data.quarter,
      plannedTarget: target,
      actualValue: data.actualValue,
      score,
    },
  });

  // Update goal status if provided
  if (data.status) {
    await prisma.goal.update({
      where: { id: data.goalId },
      data: { status: data.status },
    });
  }

  revalidatePath("/dashboard/checkins");
  revalidatePath("/dashboard/goals");
  return achievement;
}

export async function submitCheckIn(data: {
  goalSheetId: string;
  quarter: string;
  comment: string;
}) {
  const session = await auth();
  if (!session) throw new Error("Not authenticated");

  const checkIn = await prisma.checkIn.upsert({
    where: {
      goalSheetId_quarter: {
        goalSheetId: data.goalSheetId,
        quarter: data.quarter,
      },
    },
    update: { comment: data.comment, conductedAt: new Date() },
    create: {
      goalSheetId: data.goalSheetId,
      managerId: session.user.id,
      quarter: data.quarter,
      comment: data.comment,
    },
  });

  revalidatePath("/dashboard/checkins");
  revalidatePath("/dashboard/team");
  return checkIn;
}

export async function getDashboardStats(userId: string, role: string) {
  const cycle = await prisma.cycle.findFirst({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  if (!cycle) return null;

  if (role === "EMPLOYEE") {
    const goalSheet = await prisma.goalSheet.findUnique({
      where: { userId_cycleId: { userId, cycleId: cycle.id } },
      include: {
        goals: { include: { achievements: true } },
        checkIns: true,
      },
    });

    return {
      cycle,
      goalSheet,
      totalGoals: goalSheet?.goals.length || 0,
      completedGoals:
        goalSheet?.goals.filter((g) => g.status === "COMPLETED").length || 0,
      avgScore: goalSheet?.goals.length
        ? goalSheet.goals.reduce((sum, g) => {
            const latestAch = g.achievements[g.achievements.length - 1];
            return sum + (latestAch?.score || 0);
          }, 0) / goalSheet.goals.length
        : 0,
    };
  }

  if (role === "MANAGER" || role === "ADMIN") {
    const teamMembers = await prisma.user.findMany({
      where: role === "MANAGER" ? { managerId: userId } : {},
      include: {
        goalSheets: {
          where: { cycleId: cycle.id },
          include: {
            goals: { include: { achievements: true } },
            checkIns: true,
          },
        },
      },
    });

    const pendingApprovals = await prisma.goalSheet.count({
      where: {
        status: "SUBMITTED",
        cycleId: cycle.id,
        ...(role === "MANAGER" ? { user: { managerId: userId } } : {}),
      },
    });

    return {
      cycle,
      teamMembers,
      pendingApprovals,
      totalEmployees: teamMembers.length,
      goalsSubmitted: teamMembers.filter((m) =>
        m.goalSheets.some((gs) => gs.status !== "DRAFT")
      ).length,
    };
  }

  return { cycle };
}

export async function getAuditLogs() {
  return prisma.auditLog.findMany({
    include: { user: true },
    orderBy: { timestamp: "desc" },
    take: 100,
  });
}

export async function unlockGoalSheet(goalSheetId: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    throw new Error("Admin access required");

  const updated = await prisma.goalSheet.update({
    where: { id: goalSheetId },
    data: { isLocked: false },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "UNLOCKED",
      entityType: "GOAL_SHEET",
      entityId: goalSheetId,
      newValue: JSON.stringify({ isLocked: false }),
    },
  });

  revalidatePath("/dashboard/admin");
  return updated;
}
