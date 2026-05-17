// @ts-nocheck
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReportsClient } from "./reports-client";

export default async function ReportsPage() {
  const session = await auth();
  if (!session) return null;

  const cycle = await prisma.cycle.findFirst({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  if (!cycle) return <div className="empty-state"><div className="empty-state-title">No active cycle</div></div>;

  const goalSheets = await prisma.goalSheet.findMany({
    where: { cycleId: cycle.id, status: "APPROVED" },
    include: {
      user: true,
      goals: { include: { achievements: true }, orderBy: { sortOrder: "asc" } },
      checkIns: true,
    },
  });

  // Completion data
  const allSheets = await prisma.goalSheet.findMany({
    where: { cycleId: cycle.id },
    include: { user: true, checkIns: true },
  });

  return (
    <ReportsClient
      goalSheets={goalSheets}
      allSheets={allSheets}
      cycleName={cycle.name}
    />
  );
}
