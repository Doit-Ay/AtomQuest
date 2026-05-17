"use client";

import { motion } from "framer-motion";
import { QUARTERS } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function ReportsClient({
  goalSheets,
  allSheets,
  cycleName,
}: {
  goalSheets: any[];
  allSheets: any[];
  cycleName: string;
}) {
  const handleExportCSV = () => {
    const rows: string[] = [];
    rows.push(
      "Employee,Department,Goal,Thrust Area,UoM,Target,Weightage,Q1 Actual,Q1 Score,Q2 Actual,Q2 Score,Q3 Actual,Q3 Score,Q4 Actual,Q4 Score,Status"
    );

    goalSheets.forEach((gs) => {
      gs.goals.forEach((goal: any) => {
        const row = [
          gs.user.name,
          gs.user.department,
          `"${goal.title}"`,
          goal.thrustArea,
          goal.uom,
          goal.target,
          goal.weightage,
        ];

        QUARTERS.forEach((q) => {
          const ach = goal.achievements?.find((a: any) => a.quarter === q);
          row.push(ach?.actualValue ?? "");
          row.push(ach?.score ? Math.round(ach.score) : "");
        });

        row.push(goal.status);
        rows.push(row.join(","));
      });
    });

    const csv = rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AtmoQuest_Report_${cycleName.replace(/\s/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">{cycleName} • Achievement & Completion Reports</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-primary"
            onClick={() => window.open("/api/export?format=xlsx", "_blank")}
          >
            Export Excel
          </button>
          <button className="btn btn-ghost" onClick={handleExportCSV}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Achievement Report */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 24 }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
          Achievement Report
        </h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Goal</th>
                <th>Target</th>
                <th>Weight</th>
                {QUARTERS.map((q) => (
                  <th key={q}>{q}</th>
                ))}
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {goalSheets.flatMap((gs) =>
                gs.goals.map((goal: any) => (
                  <tr key={goal.id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{gs.user.name}</div>
                    </td>
                    <td style={{ maxWidth: 200 }}>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{goal.title}</div>
                      <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                        {goal.thrustArea}
                      </div>
                    </td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                      {goal.target}
                    </td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                      {goal.weightage}%
                    </td>
                    {QUARTERS.map((q) => {
                      const ach = goal.achievements?.find((a: any) => a.quarter === q);
                      return (
                        <td
                          key={q}
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 12,
                            color: ach
                              ? ach.score >= 80
                                ? "var(--accent-teal)"
                                : ach.score >= 50
                                ? "var(--accent-amber)"
                                : "var(--accent-rose)"
                              : "var(--text-tertiary)",
                          }}
                        >
                          {ach ? (
                            <div>
                              <div>{ach.actualValue}</div>
                              <div style={{ fontSize: 10 }}>{Math.round(ach.score)}%</div>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                      );
                    })}
                    <td>
                      <span
                        className={`badge badge-${
                          goal.status === "COMPLETED" ? "teal"
                            : goal.status === "ON_TRACK" ? "violet"
                            : "rose"
                        }`}
                        style={{ fontSize: 9 }}
                      >
                        {goal.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Completion Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
          Completion Dashboard
        </h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Goal Sheet</th>
                {QUARTERS.map((q) => (
                  <th key={q}>{q} Check-in</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allSheets.map((gs) => (
                <tr key={gs.id}>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{gs.user.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                      {gs.user.department}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge badge-${
                        gs.status === "APPROVED" ? "teal"
                          : gs.status === "SUBMITTED" ? "amber"
                          : gs.status === "RETURNED" ? "rose"
                          : "gray"
                      }`}
                    >
                      {gs.status}
                    </span>
                  </td>
                  {QUARTERS.map((q) => {
                    const done = gs.checkIns?.some((ci: any) => ci.quarter === q);
                    return (
                      <td key={q}>
                        <span
                          style={{
                            display: "inline-block",
                            width: 24,
                            height: 24,
                            borderRadius: "var(--radius-sm)",
                            background: done
                              ? "var(--accent-teal-dim)"
                              : "var(--bg-primary)",
                            border: `1px solid ${done ? "rgba(0,212,170,0.3)" : "var(--border-subtle)"}`,
                            textAlign: "center",
                            lineHeight: "24px",
                            fontSize: 12,
                            color: done ? "var(--accent-teal)" : "var(--text-tertiary)",
                          }}
                        >
                          {done ? "✓" : "—"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
