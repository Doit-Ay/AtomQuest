// @ts-nocheck
import { auth } from "@/lib/auth";
import { getDashboardStats } from "@/actions/goals";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) return null;

  const stats = await getDashboardStats(session.user.id, session.user.role);

  return (
    <DashboardClient
      stats={stats}
      role={session.user.role}
      userId={session.user.id}
      userName={session.user.name || ""}
    />
  );
}
