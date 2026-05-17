import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/shared/skeleton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="dashboard-shell">
      <Sidebar
        role={session.user.role}
        name={session.user.name || ""}
        email={session.user.email || ""}
      />
      <div className="dashboard-main">
        <Topbar
          name={session.user.name || ""}
          role={session.user.role}
        />
        <main className="dashboard-content">
          <ErrorBoundary>
            <Suspense fallback={<DashboardSkeleton />}>
              {children}
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
