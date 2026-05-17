import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApprovalsClient } from "./approvals-client";

export default async function ApprovalsPage() {
  const session = await auth();
  if (!session) return null;

  const cycle = await prisma.cycle.findFirst({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  if (!cycle) return <div className="empty-state"><div className="empty-state-title">No active cycle</div></div>;

  const pending = await prisma.goalSheet.findMany({
    where: {
      status: "SUBMITTED",
      cycleId: cycle.id,
      ...(session.user.role === "MANAGER"
        ? { user: { managerId: session.user.id } }
        : {}),
    },
    include: {
      user: true,
      goals: { orderBy: { sortOrder: "asc" } },
      cycle: true,
    },
    orderBy: { submittedAt: "desc" },
  });

  return <ApprovalsClient pending={pending} />;
}
