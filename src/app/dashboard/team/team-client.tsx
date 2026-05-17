"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QUARTERS } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function TeamClient({
  members,
  cycleName,
}: {
  members: any[];
  cycleName: string;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Overview</h1>
          <p className="page-subtitle">{cycleName} • {members.length} members</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {members.map((member, i) => {
          const gs = member.goalSheets?.[0];
          const goals = gs?.goals || [];
          const isExpanded = expanded === member.id;

          return (
            <motion.div
              key={member.id}
              className="glass-card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div
                style={{
                  padding: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => setExpanded(isExpanded ? null : member.id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="avatar avatar-lg">
                    {member.name.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{member.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                      {member.email} • {member.department}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span
                    className={`badge badge-${
                      gs?.status === "APPROVED" ? "teal"
                        : gs?.status === "SUBMITTED" ? "amber"
                        : gs?.status === "RETURNED" ? "rose"
                        : "gray"
                    }`}
                  >
                    {gs?.status || "No Sheet"}
                  </span>
                  <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-secondary)" }}>
                    {goals.length} goals
                  </span>
                  <span style={{ color: "var(--text-tertiary)" }}>
                    {isExpanded ? "▾" : "▸"}
                  </span>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && goals.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border-subtle)" }}>
                      <div className="table-container" style={{ marginTop: 12 }}>
                        <table>
                          <thead>
                            <tr>
                              <th>Goal</th>
                              <th>Weight</th>
                              <th>Status</th>
                              {QUARTERS.map((q) => (
                                <th key={q}>{q}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {goals.map((goal: any) => (
                              <tr key={goal.id}>
                                <td style={{ fontWeight: 500 }}>{goal.title}</td>
                                <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                  {goal.weightage}%
                                </td>
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
                                {QUARTERS.map((q) => {
                                  const ach = goal.achievements?.find(
                                    (a: any) => a.quarter === q
                                  );
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
                                      {ach ? `${Math.round(ach.score)}%` : "—"}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Check-in History */}
                      {gs?.checkIns?.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                            Check-in History
                          </div>
                          {gs.checkIns.map((ci: any) => (
                            <div
                              key={ci.id}
                              style={{
                                padding: "8px 12px",
                                background: "var(--bg-primary)",
                                borderRadius: "var(--radius-md)",
                                marginBottom: 6,
                                fontSize: 12,
                              }}
                            >
                              <div style={{ color: "var(--text-tertiary)", marginBottom: 2, fontSize: 11 }}>
                                {ci.quarter} • {ci.manager.name} • {new Date(ci.conductedAt).toLocaleDateString()}
                              </div>
                              <div style={{ color: "var(--text-secondary)" }}>{ci.comment}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
