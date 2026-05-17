// @ts-nocheck
import { auth } from "@/lib/auth";
import { getGoalSheetForUser, ensureGoalSheet } from "@/actions/goals";
import { GoalsClient } from "./goals-client";

export default async function GoalsPage() {
  const session = await auth();
  if (!session) return null;

  // Ensure goal sheet exists for this user
  await ensureGoalSheet();

  const goalSheet = await getGoalSheetForUser(session.user.id);

  return (
    <GoalsClient
      goalSheet={goalSheet}
      role={session.user.role}
    />
  );
}
