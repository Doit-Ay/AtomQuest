"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { updateAchievement, submitCheckIn } from "@/actions/goals";
import { QUARTERS, UOM_LABELS } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function CheckInsClient({
  goalSheets,
  role,
}: {
  goalSheets: any[];
  role: string;
}) {
  const [selectedQuarter, setSelectedQuarter] = useState("Q1");
  const [selectedSheet, setSelectedSheet] = useState<string | null>(
    goalSheets[0]?.id || null
  );
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingGoal, setSavingGoal] = useState("");

  const activeSheet = goalSheets.find((gs) => gs.id === selectedSheet);
  const goals = activeSheet?.goals || [];
  const existingCheckIn = activeSheet?.checkIns?.find(
    (ci: any) => ci.quarter === selectedQuarter
  );

  const handleAchievementUpdate = async (
    goalId: string,
    value: number,
    status: string
  ) => {
    setSavingGoal(goalId);
    try {
      await updateAchievement({
        goalId,
        quarter: selectedQuarter,
        actualValue: value,
        status,
      });
    } catch (e) {
      console.error(e);
    }
    setSavingGoal("");
  };

  const handleSubmitCheckIn = async () => {
    if (!activeSheet || !comment.trim()) return;
    setLoading(true);
    try {
      await submitCheckIn({
        goalSheetId: activeSheet.id,
        quarter: selectedQuarter,
        comment,
      });
      setComment("");
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {role === "EMPLOYEE" ? "My Check-ins" : "Team Check-ins"}
          </h1>
          <p className="page-subtitle">
            Quarterly progress updates and reviews
          </p>
        </div>
      </div>

      {/* Quarter Selector */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 20,
        }}
      >
        {QUARTERS.map((q) => (
          <button
            key={q}
            className={`chip ${selectedQuarter === q ? "chip-active" : ""}`}
            onClick={() => setSelectedQuarter(q)}
            style={{ padding: "6px 16px", fontSize: 13 }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Sheet Selector (Manager/Admin) */}
      {role !== "EMPLOYEE" && goalSheets.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {goalSheets.map((gs) => (
            <button
              key={gs.id}
              className={`chip ${selectedSheet === gs.id ? "chip-active" : ""}`}
              onClick={() => setSelectedSheet(gs.id)}
            >
              {gs.user.name}
            </button>
          ))}
        </div>
      )}

      {goalSheets.length === 0 && (
        <div className="empty-state glass-card">
          <div className="empty-state-icon" style={{ fontSize: 24 }}>◈</div>
          <div className="empty-state-title">No Approved Goal Sheets</div>
          <div className="empty-state-desc">
            Check-ins are available after goal sheets are approved.
          </div>
        </div>
      )}

      {activeSheet && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Goal Achievement Cards */}
          {goals.map((goal: any, i: number) => {
            const achievement = goal.achievements?.find(
              (a: any) => a.quarter === selectedQuarter
            );

            return (
              <motion.div
                key={goal.id}
                className="glass-card"
                style={{ padding: 16 }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 16,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <span
                        className="chip chip-blue"
                        style={{ fontSize: 10, padding: "2px 6px" }}
                      >
                        {goal.thrustArea}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                        {UOM_LABELS[goal.uom]}
                      </span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                      {goal.title}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 16,
                        fontSize: 12,
                        color: "var(--text-secondary)",
                      }}
                    >
                      <span>
                        Target:{" "}
                        <strong style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {goal.uom === "TIMELINE" && goal.targetDate
                            ? new Date(goal.targetDate).toLocaleDateString()
                            : goal.target}
                        </strong>
                      </span>
                      <span>
                        Weight:{" "}
                        <strong style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {goal.weightage}%
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Achievement Input */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      minWidth: 200,
                    }}
                  >
                    <div>
                      <label
                        className="label"
                        style={{ fontSize: 10, marginBottom: 4 }}
                      >
                        Actual Achievement
                      </label>
                      {goal.uom === "ZERO" ? (
                        <select
                          className="select"
                          style={{ padding: "6px 10px", fontSize: 13 }}
                          defaultValue={achievement?.actualValue ?? ""}
                          onChange={(e) =>
                            handleAchievementUpdate(
                              goal.id,
                              parseFloat(e.target.value),
                              parseFloat(e.target.value) === 0
                                ? "COMPLETED"
                                : "ON_TRACK"
                            )
                          }
                        >
                          <option value="">Select</option>
                          <option value="0">Zero (Success)</option>
                          <option value="1">Non-zero (Fail)</option>
                        </select>
                      ) : (
                        <input
                          type="number"
                          className="input"
                          style={{ padding: "6px 10px", fontSize: 13 }}
                          defaultValue={achievement?.actualValue ?? ""}
                          placeholder="Enter actual"
                          onBlur={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) {
                              handleAchievementUpdate(goal.id, val, "ON_TRACK");
                            }
                          }}
                        />
                      )}
                    </div>
                    <div>
                      <label
                        className="label"
                        style={{ fontSize: 10, marginBottom: 4 }}
                      >
                        Status
                      </label>
                      <select
                        className="select"
                        style={{ padding: "6px 10px", fontSize: 13 }}
                        defaultValue={goal.status}
                        onChange={(e) =>
                          handleAchievementUpdate(
                            goal.id,
                            achievement?.actualValue || 0,
                            e.target.value
                          )
                        }
                      >
                        <option value="NOT_STARTED">Not Started</option>
                        <option value="ON_TRACK">On Track</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                    {savingGoal === goal.id && (
                      <span style={{ fontSize: 11, color: "var(--accent-teal)" }}>
                        Saving...
                      </span>
                    )}
                    {achievement && (
                      <div
                        style={{
                          fontSize: 12,
                          fontFamily: "'JetBrains Mono', monospace",
                          color:
                            achievement.score >= 80
                              ? "var(--accent-teal)"
                              : achievement.score >= 50
                              ? "var(--accent-amber)"
                              : "var(--accent-rose)",
                        }}
                      >
                        Score: {Math.round(achievement.score)}%
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Manager Check-in Comment */}
          {role !== "EMPLOYEE" && (
            <motion.div
              className="glass-card"
              style={{ padding: 16 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 12,
                }}
              >
                Check-in Comment
              </h3>

              {existingCheckIn && (
                <div
                  style={{
                    padding: "10px 14px",
                    background: "var(--bg-primary)",
                    borderRadius: "var(--radius-md)",
                    marginBottom: 12,
                    fontSize: 13,
                    color: "var(--text-secondary)",
                  }}
                >
                  <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 4 }}>
                    {existingCheckIn.manager.name} •{" "}
                    {new Date(existingCheckIn.conductedAt).toLocaleDateString()}
                  </div>
                  {existingCheckIn.comment}
                </div>
              )}

              <textarea
                className="textarea"
                placeholder="Write your check-in feedback..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <button
                  className="btn btn-primary"
                  onClick={handleSubmitCheckIn}
                  disabled={loading || !comment.trim()}
                >
                  {loading ? "Submitting..." : existingCheckIn ? "Update Check-in" : "Submit Check-in"}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
