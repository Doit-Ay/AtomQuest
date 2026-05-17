"use client";

import { motion } from "framer-motion";
import Link from "next/link";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface DashboardClientProps {
  stats: any;
  role: string;
  userId: string;
  userName: string;
}

function ProgressRing({
  value,
  size = 80,
  stroke = 6,
  color = "var(--accent-teal)",
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;

  return (
    <div className="progress-ring-container" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          className="progress-ring-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
        />
        <motion.circle
          className="progress-ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          stroke={color}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <span
        className="progress-ring-label"
        style={{ fontSize: size > 60 ? 16 : 12 }}
      >
        {Math.round(value)}%
      </span>
    </div>
  );
}

function MetricCard({
  label,
  value,
  change,
  changeType,
  delay = 0,
}: {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  delay?: number;
}) {
  return (
    <motion.div
      className="glass-card metric-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {change && (
        <div
          className="metric-change"
          style={{
            color:
              changeType === "positive"
                ? "var(--accent-teal)"
                : changeType === "negative"
                ? "var(--accent-rose)"
                : "var(--text-secondary)",
          }}
        >
          {change}
        </div>
      )}
    </motion.div>
  );
}

export function DashboardClient({
  stats,
  role,
  userName,
}: DashboardClientProps) {
  if (!stats) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">◆</div>
        <div className="empty-state-title">No Active Cycle</div>
        <div className="empty-state-desc">
          There is no active performance cycle. Contact your administrator.
        </div>
      </div>
    );
  }

  if (role === "EMPLOYEE") {
    return <EmployeeDashboard stats={stats} userName={userName} />;
  }

  return <ManagerDashboard stats={stats} role={role} />;
}

function EmployeeDashboard({
  stats,
  userName,
}: {
  stats: any;
  userName: string;
}) {
  const goalSheet = stats.goalSheet;
  const goals = goalSheet?.goals || [];
  const avgScore = stats.avgScore || 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {userName.split(" ")[0]}</h1>
          <p className="page-subtitle">
            {stats.cycle.name} • Goal tracking overview
          </p>
        </div>
        <Link href="/dashboard/goals" className="btn btn-primary">
          View My Goals
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="dashboard-grid" style={{ marginBottom: 24 }}>
        <MetricCard
          label="Total Goals"
          value={stats.totalGoals}
          delay={0}
        />
        <MetricCard
          label="Completed"
          value={stats.completedGoals}
          change={`${stats.totalGoals > 0 ? Math.round((stats.completedGoals / stats.totalGoals) * 100) : 0}% done`}
          changeType="positive"
          delay={0.1}
        />
        <MetricCard
          label="Avg Score"
          value={`${Math.round(avgScore)}%`}
          change={avgScore >= 80 ? "On track" : "Needs attention"}
          changeType={avgScore >= 80 ? "positive" : "negative"}
          delay={0.2}
        />
        <MetricCard
          label="Goal Sheet Status"
          value={goalSheet?.status || "Not Started"}
          delay={0.3}
        />
      </div>

      {/* Goal Progress Cards */}
      {goals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 16,
              color: "var(--text-primary)",
            }}
          >
            Goal Progress
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12 }}>
            {goals.map((goal: any, i: number) => {
              const latestAch = goal.achievements[goal.achievements.length - 1];
              const score = latestAch?.score || 0;

              return (
                <motion.div
                  key={goal.id}
                  className="glass-card"
                  style={{ padding: 16, display: "flex", gap: 16, alignItems: "center" }}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                >
                  <ProgressRing
                    value={score}
                    size={56}
                    stroke={5}
                    color={
                      goal.status === "COMPLETED"
                        ? "var(--accent-teal)"
                        : goal.status === "ON_TRACK"
                        ? "var(--accent-violet)"
                        : "var(--accent-rose)"
                    }
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                      {goal.title}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span
                        className={`chip chip-${
                          goal.status === "COMPLETED"
                            ? "teal"
                            : goal.status === "ON_TRACK"
                            ? "violet"
                            : "rose"
                        }`}
                        style={{ fontSize: 10, padding: "2px 8px" }}
                      >
                        <span
                          className={`status-dot status-dot-${
                            goal.status === "COMPLETED"
                              ? "teal"
                              : goal.status === "ON_TRACK"
                              ? "violet"
                              : "rose"
                          }`}
                          style={{ width: 6, height: 6 }}
                        />
                        {goal.status === "NOT_STARTED"
                          ? "Not Started"
                          : goal.status === "ON_TRACK"
                          ? "On Track"
                          : "Completed"}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--text-tertiary)",
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {goal.weightage}%w
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {goals.length === 0 && (
        <div className="empty-state glass-card">
          <div className="empty-state-icon">◎</div>
          <div className="empty-state-title">No Goals Yet</div>
          <div className="empty-state-desc">
            Start setting your goals for {stats.cycle.name}
          </div>
          <Link
            href="/dashboard/goals"
            className="btn btn-primary"
            style={{ marginTop: 16 }}
          >
            Create Goals
          </Link>
        </div>
      )}
    </div>
  );
}

function ManagerDashboard({
  stats,
  role,
}: {
  stats: any;
  role: string;
}) {
  const team = stats.teamMembers || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {role === "ADMIN" ? "Admin Dashboard" : "Team Dashboard"}
          </h1>
          <p className="page-subtitle">
            {stats.cycle.name} • Team performance overview
          </p>
        </div>
        {stats.pendingApprovals > 0 && (
          <Link href="/dashboard/approvals" className="btn btn-violet">
            {stats.pendingApprovals} Pending Approval{stats.pendingApprovals > 1 ? "s" : ""}
          </Link>
        )}
      </div>

      {/* Metrics */}
      <div className="dashboard-grid" style={{ marginBottom: 24 }}>
        <MetricCard
          label="Team Members"
          value={stats.totalEmployees}
          delay={0}
        />
        <MetricCard
          label="Goals Submitted"
          value={stats.goalsSubmitted}
          change={`${stats.totalEmployees > 0 ? Math.round((stats.goalsSubmitted / stats.totalEmployees) * 100) : 0}% complete`}
          changeType="positive"
          delay={0.1}
        />
        <MetricCard
          label="Pending Approvals"
          value={stats.pendingApprovals}
          change={stats.pendingApprovals > 0 ? "Action required" : "All clear"}
          changeType={stats.pendingApprovals > 0 ? "negative" : "positive"}
          delay={0.2}
        />
      </div>

      {/* Team Members */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2
          style={{
            fontSize: 16,
            fontWeight: 600,
            marginBottom: 16,
            color: "var(--text-primary)",
          }}
        >
          Team Overview
        </h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Status</th>
                <th>Goals</th>
                <th>Avg Score</th>
              </tr>
            </thead>
            <tbody>
              {team.map((member: any, i: number) => {
                const gs = member.goalSheets?.[0];
                const goalCount = gs?.goals?.length || 0;
                const avgScore = goalCount > 0
                  ? gs.goals.reduce((sum: number, g: any) => {
                      const latest = g.achievements?.[g.achievements.length - 1];
                      return sum + (latest?.score || 0);
                    }, 0) / goalCount
                  : 0;

                return (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                  >
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="avatar">
                          {member.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{member.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {member.department}
                    </td>
                    <td>
                      <span
                        className={`badge badge-${
                          gs?.status === "APPROVED"
                            ? "teal"
                            : gs?.status === "SUBMITTED"
                            ? "amber"
                            : gs?.status === "RETURNED"
                            ? "rose"
                            : "gray"
                        }`}
                      >
                        {gs?.status || "No Sheet"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {goalCount}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          color:
                            avgScore >= 80
                              ? "var(--accent-teal)"
                              : avgScore >= 50
                              ? "var(--accent-amber)"
                              : avgScore > 0
                              ? "var(--accent-rose)"
                              : "var(--text-tertiary)",
                        }}
                      >
                        {avgScore > 0 ? `${Math.round(avgScore)}%` : "—"}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
