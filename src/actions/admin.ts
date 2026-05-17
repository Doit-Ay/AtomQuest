"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// ─── Cycle Management ───

export async function createCycle(data: {
  name: string;
  year: number;
  startDate: string;
  endDate: string;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    throw new Error("Admin access required");

  const cycle = await prisma.cycle.create({
    data: {
      name: data.name,
      year: data.year,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      status: "ACTIVE",
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CREATED",
      entityType: "CYCLE",
      entityId: cycle.id,
      newValue: JSON.stringify(data),
    },
  });

  revalidatePath("/dashboard/admin");
  return cycle;
}

export async function closeCycle(cycleId: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    throw new Error("Admin access required");

  const updated = await prisma.cycle.update({
    where: { id: cycleId },
    data: { status: "CLOSED" },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATED",
      entityType: "CYCLE",
      entityId: cycleId,
      previousValue: JSON.stringify({ status: "ACTIVE" }),
      newValue: JSON.stringify({ status: "CLOSED" }),
    },
  });

  revalidatePath("/dashboard/admin");
  return updated;
}

export async function activateCycle(cycleId: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    throw new Error("Admin access required");

  // Deactivate all other cycles first
  await prisma.cycle.updateMany({
    where: { status: "ACTIVE" },
    data: { status: "CLOSED" },
  });

  const updated = await prisma.cycle.update({
    where: { id: cycleId },
    data: { status: "ACTIVE" },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATED",
      entityType: "CYCLE",
      entityId: cycleId,
      previousValue: JSON.stringify({ status: "CLOSED" }),
      newValue: JSON.stringify({ status: "ACTIVE" }),
    },
  });

  revalidatePath("/dashboard/admin");
  return updated;
}

// ─── User Management ───

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: string;
  department: string;
  managerId?: string;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    throw new Error("Admin access required");

  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing) throw new Error("Email already exists");

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      department: data.department,
      managerId: data.managerId || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CREATED",
      entityType: "USER",
      entityId: user.id,
      newValue: JSON.stringify({
        name: data.name,
        email: data.email,
        role: data.role,
        department: data.department,
      }),
    },
  });

  revalidatePath("/dashboard/admin");
  return user;
}

export async function updateUser(
  userId: string,
  data: {
    name?: string;
    role?: string;
    department?: string;
    managerId?: string | null;
  }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    throw new Error("Admin access required");

  const previous = await prisma.user.findUnique({ where: { id: userId } });
  if (!previous) throw new Error("User not found");

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATED",
      entityType: "USER",
      entityId: userId,
      previousValue: JSON.stringify({
        name: previous.name,
        role: previous.role,
        department: previous.department,
      }),
      newValue: JSON.stringify(data),
    },
  });

  revalidatePath("/dashboard/admin");
  return updated;
}
