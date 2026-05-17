import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminClient } from "./admin-client";

export default async function AdminPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return (
      <div className="empty-state">
        <div className="empty-state-title">Access Denied</div>
        <div className="empty-state-desc">Admin access required.</div>
      </div>
    );
  }

  const cycles = await prisma.cycle.findMany({ orderBy: { createdAt: "desc" } });
  const users = await prisma.user.findMany({
    include: { manager: true },
    orderBy: { name: "asc" },
  });

  const activeCycle = cycles.find((c) => c.status === "ACTIVE");
  const lockedSheets = activeCycle
    ? await prisma.goalSheet.findMany({
        where: { cycleId: activeCycle.id, isLocked: true },
        include: { user: true },
      })
    : [];

  return (
    <AdminClient
      cycles={cycles}
      users={users}
      lockedSheets={lockedSheets}
    />
  );
}
