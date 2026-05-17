// @ts-nocheck
import { auth } from "@/lib/auth";
import { getGoalSheetForUser } from "@/actions/goals";
import { prisma } from "@/lib/prisma";
import { CheckInsClient } from "./checkins-client";

export default async function CheckInsPage() {
  const session = await auth();
  if (!session) return null;

  if (session.user.role === "EMPLOYEE") {
    const goalSheet = await getGoalSheetForUser(session.user.id);
    return <CheckInsClient goalSheets={goalSheet ? [goalSheet] : []} role="EMPLOYEE" />;
  }

  // Manager/Admin: show team's goal sheets
  const cycle = await prisma.cycle.findFirst({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  if (!cycle) return <div className="empty-state"><div className="empty-state-title">No active cycle</div></div>;

  const goalSheets = await prisma.goalSheet.findMany({
    where: {
      cycleId: cycle.id,
      status: "APPROVED",
      ...(session.user.role === "MANAGER"
        ? { user: { managerId: session.user.id } }
        : {}),
    },
    include: {
      user: true,
      goals: { orderBy: { sortOrder: "asc" }, include: { achievements: true } },
      checkIns: { include: { manager: true } },
      cycle: true,
    },
  });

  return <CheckInsClient goalSheets={goalSheets} role={session.user.role} />;
}
