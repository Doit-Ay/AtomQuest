import { auth } from "@/lib/auth";
import { getEligibleRecipients } from "@/actions/shared-goals";
import { SharedGoalsClient } from "./shared-goals-client";

export default async function SharedGoalsPage() {
  const session = await auth();
  if (!session) return null;

  if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
    return (
      <div className="empty-state">
        <div className="empty-state-title">Access Denied</div>
        <div className="empty-state-desc">
          Only Admins and Managers can create shared goals.
        </div>
      </div>
    );
  }

  const recipients = await getEligibleRecipients();
  return <SharedGoalsClient recipients={recipients} />;
}
