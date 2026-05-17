// @ts-nocheck
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendSharedGoalEmail } from "@/lib/email";

export async function createSharedGoal(data: {
  thrustArea: string;
  title: string;
  description: string;
  uom: string;
  target: number;
  targetDate?: string;
  defaultWeightage: number;
  recipientIds: string[];
}) {
  const session = await auth();
  if (!session) throw new Error("Not authenticated");
  if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
    throw new Error("Only Admin or Manager can create shared goals");
  }

  const cycle = await prisma.cycle.findFirst({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  if (!cycle) throw new Error("No active cycle found");

  const results = [];

  for (const recipientId of data.recipientIds) {
    // Ensure goal sheet exists
    let goalSheet = await prisma.goalSheet.findUnique({
      where: { userId_cycleId: { userId: recipientId, cycleId: cycle.id } },
    });

    if (!goalSheet) {
      goalSheet = await prisma.goalSheet.create({
        data: { userId: recipientId, cycleId: cycle.id, status: "DRAFT" },
      });
    }

    // Check if this shared goal already exists
    const existing = await prisma.goal.findFirst({
      where: {
        goalSheetId: goalSheet.id,
        title: data.title,
        isShared: true,
      },
    });

    if (existing) continue;

    // Get current goal count for sort order
    const goalCount = await prisma.goal.count({
      where: { goalSheetId: goalSheet.id },
    });

    // Create the shared goal
    const goal = await prisma.goal.create({
      data: {
        goalSheetId: goalSheet.id,
        thrustArea: data.thrustArea,
        title: data.title,
        description: data.description,
        uom: data.uom,
        target: data.target,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
        weightage: data.defaultWeightage,
        isShared: true,
        sortOrder: goalCount,
      },
    });

    // Send email notification
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
    });

    if (recipient) {
      await sendSharedGoalEmail({
        employeeEmail: recipient.email,
        employeeName: recipient.name,
        goalTitle: data.title,
        thrustArea: data.thrustArea,
        assignedBy: session.user.name || "Admin",
      });
    }

    results.push(goal);
  }

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CREATED",
      entityType: "SHARED_GOAL",
      entityId: results[0]?.id || "batch",
      newValue: JSON.stringify({
        title: data.title,
        recipientCount: data.recipientIds.length,
        recipients: data.recipientIds,
      }),
    },
  });

  revalidatePath("/dashboard/goals");
  revalidatePath("/dashboard/admin");
  return results;
}

export async function getEligibleRecipients() {
  const session = await auth();
  if (!session) throw new Error("Not authenticated");

  const where =
    session.user.role === "MANAGER"
      ? { managerId: session.user.id }
      : session.user.role === "ADMIN"
      ? { role: "EMPLOYEE" }
      : { id: "none" };

  return prisma.user.findMany({
    where,
    select: { id: true, name: true, email: true, department: true },
    orderBy: { name: "asc" },
  });
}
