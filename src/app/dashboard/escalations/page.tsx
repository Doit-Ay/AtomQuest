// @ts-nocheck
import { auth } from "@/lib/auth";
import { getEscalations } from "@/actions/escalations";
import { EscalationsClient } from "./escalations-client";

export default async function EscalationsPage() {
  const session = await auth();
  if (!session) return null;

  if (session.user.role === "EMPLOYEE") {
    return (
      <div className="empty-state">
        <div className="empty-state-title">Access Denied</div>
        <div className="empty-state-desc">
          Escalation management is available to Managers and Admins only.
        </div>
      </div>
    );
  }

  const { rules, escalations } = await getEscalations();
  return <EscalationsClient rules={rules} escalations={escalations} />;
}
