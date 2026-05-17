// @ts-nocheck
import { auth } from "@/lib/auth";
import { getAuditLogs } from "@/actions/goals";
import { AuditClient } from "./audit-client";

export default async function AuditPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return (
      <div className="empty-state">
        <div className="empty-state-title">Access Denied</div>
        <div className="empty-state-desc">Admin access required.</div>
      </div>
    );
  }

  const logs = await getAuditLogs();
  return <AuditClient logs={logs} />;
}
