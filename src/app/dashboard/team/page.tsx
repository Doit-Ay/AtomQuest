// @ts-nocheck
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TeamClient } from "./team-client";

export default async function TeamPage() {
  const session = await auth();
  if (!session) return null;

  const cycle = await prisma.cycle.findFirst({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  if (!cycle) return <div className="empty-state"><div className="empty-state-title">No active cycle</div></div>;

  const members = await prisma.user.findMany({
    where:
      session.user.role === "MANAGER"
        ? { managerId: session.user.id }
        : { role: "EMPLOYEE" },
    include: {
      goalSheets: {
        where: { cycleId: cycle.id },
        include: {
          goals: { include: { achievements: true }, orderBy: { sortOrder: "asc" } },
          checkIns: { include: { manager: true } },
        },
      },
      manager: true,
    },
  });

  return <TeamClient members={members} cycleName={cycle.name} />;
}
