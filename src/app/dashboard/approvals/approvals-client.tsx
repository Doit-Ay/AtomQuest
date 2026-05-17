"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { approveGoalSheet, returnGoalSheet, updateGoal } from "@/actions/goals";
import { UOM_LABELS } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function ApprovalsClient({ pending }: { pending: any[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [returnNote, setReturnNote] = useState("");
  const [showReturn, setShowReturn] = useState<string | null>(null);
  const [loading, setLoading] = useState("");
  const [editingGoal, setEditingGoal] = useState<any>(null);

  const handleApprove = async (id: string) => {
    setLoading(id + "_approve");
    await approveGoalSheet(id);
    setLoading("");
  };

  const handleReturn = async (id: string) => {
    if (!returnNote.trim()) return;
    setLoading(id + "_return");
    await returnGoalSheet(id, returnNote);
    setReturnNote("");
    setShowReturn(null);
    setLoading("");
  };

  const handleGoalUpdate = async (goalId: string, data: any) => {
    await updateGoal(goalId, data);
    setEditingGoal(null);
  };

  if (pending.length === 0) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Approvals</h1>
            <p className="page-subtitle">Review and approve submitted goal sheets</p>
          </div>
        </div>
        <div className="empty-state glass-card">
          <div className="empty-state-icon" style={{ fontSize: 24 }}>✓</div>
          <div className="empty-state-title">All Clear!</div>
          <div className="empty-state-desc">
            No pending goal sheets to review right now.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Approvals</h1>
          <p className="page-subtitle">
            {pending.length} goal sheet{pending.length > 1 ? "s" : ""} pending review
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {pending.map((gs, i) => {
          const isExpanded = expandedId === gs.id;
          const totalW = gs.goals.reduce((s: number, g: any) => s + g.weightage, 0);

          return (
            <motion.div
              key={gs.id}
              className="glass-card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              {/* Summary Row */}
              <div
                style={{
                  padding: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => setExpandedId(isExpanded ? null : gs.id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="avatar avatar-lg">
                    {gs.user.name.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{gs.user.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                      {gs.user.department} • {gs.goals.length} goals • {totalW}% weightage
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                      Submitted {new Date(gs.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 18, color: "var(--text-tertiary)" }}>
                    {isExpanded ? "▾" : "▸"}
                  </span>
                </div>
              </div>

              {/* Expanded Detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border-subtle)" }}>
                      {/* Goals Table */}
                      <div className="table-container" style={{ marginTop: 12 }}>
                        <table>
                          <thead>
                            <tr>
                              <th>Goal</th>
                              <th>Thrust Area</th>
                              <th>UoM</th>
                              <th>Target</th>
                              <th>Weightage</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {gs.goals.map((goal: any) => (
                              <tr key={goal.id}>
                                <td>
                                  <div style={{ fontWeight: 500 }}>{goal.title}</div>
                                  <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                                    {goal.description}
                                  </div>
                                </td>
                                <td>
                                  <span className="chip chip-blue" style={{ fontSize: 10, padding: "2px 6px" }}>
                                    {goal.thrustArea}
                                  </span>
                                </td>
                                <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                                  {UOM_LABELS[goal.uom] || goal.uom}
                                </td>
                                <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
                                  {editingGoal?.id === goal.id ? (
                                    <input
                                      type="number"
                                      className="input"
                                      style={{ width: 80, padding: "4px 8px", fontSize: 12 }}
                                      defaultValue={goal.target}
                                      onBlur={(e) => {
                                        handleGoalUpdate(goal.id, {
                                          target: parseFloat(e.target.value),
                                        });
                                      }}
                                      autoFocus
                                    />
                                  ) : goal.uom === "TIMELINE" && goal.targetDate ? (
                                    new Date(goal.targetDate).toLocaleDateString()
                                  ) : (
                                    goal.target
                                  )}
                                </td>
                                <td style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: "var(--accent-teal)" }}>
                                  {editingGoal?.id === goal.id ? (
                                    <input
                                      type="number"
                                      className="input"
                                      style={{ width: 60, padding: "4px 8px", fontSize: 12 }}
                                      defaultValue={goal.weightage}
                                      onBlur={(e) => {
                                        handleGoalUpdate(goal.id, {
                                          weightage: parseFloat(e.target.value),
                                        });
                                      }}
                                    />
                                  ) : (
                                    `${goal.weightage}%`
                                  )}
                                </td>
                                <td>
                                  <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() =>
                                      setEditingGoal(editingGoal?.id === goal.id ? null : goal)
                                    }
                                  >
                                    {editingGoal?.id === goal.id ? "Done" : "Edit"}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
                        {showReturn === gs.id ? (
                          <div style={{ display: "flex", gap: 8, flex: 1 }}>
                            <input
                              className="input"
                              placeholder="Reason for returning..."
                              value={returnNote}
                              onChange={(e) => setReturnNote(e.target.value)}
                              style={{ flex: 1 }}
                            />
                            <button
                              className="btn btn-danger"
                              onClick={() => handleReturn(gs.id)}
                              disabled={!returnNote.trim() || loading === gs.id + "_return"}
                            >
                              {loading === gs.id + "_return" ? "..." : "Confirm Return"}
                            </button>
                            <button
                              className="btn btn-ghost"
                              onClick={() => { setShowReturn(null); setReturnNote(""); }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              className="btn btn-danger"
                              onClick={() => setShowReturn(gs.id)}
                            >
                              Return for Rework
                            </button>
                            <button
                              className="btn btn-primary"
                              onClick={() => handleApprove(gs.id)}
                              disabled={loading === gs.id + "_approve"}
                            >
                              {loading === gs.id + "_approve" ? "Approving..." : "Approve & Lock"}
                            </button>
                          </>
                        )}
                      </div>
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
