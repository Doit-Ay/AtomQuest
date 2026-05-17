"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createGoal, deleteGoal, submitGoalSheet } from "@/actions/goals";
import { THRUST_AREAS, UOM_LABELS, GOAL_SHEET_STATUS } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface GoalsClientProps {
  goalSheet: any;
  role: string;
}

export function GoalsClient({ goalSheet, role }: GoalsClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const goals = goalSheet?.goals || [];
  const totalWeightage = goals.reduce((s: number, g: any) => s + g.weightage, 0);
  const isLocked = goalSheet?.isLocked;
  const canEdit = !isLocked && (goalSheet?.status === "DRAFT" || goalSheet?.status === "RETURNED");
  const canSubmit = canEdit && goals.length > 0 && Math.abs(totalWeightage - 100) < 0.01;

  const statusConfig = GOAL_SHEET_STATUS[goalSheet?.status as keyof typeof GOAL_SHEET_STATUS] || GOAL_SHEET_STATUS.DRAFT;

  const handleSubmit = async () => {
    if (!goalSheet?.id) return;
    setLoading(true);
    setError("");
    try {
      await submitGoalSheet(goalSheet.id);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Goals</h1>
          <p className="page-subtitle">
            {goalSheet?.cycle?.name || "Current Cycle"} •{" "}
            <span className={`badge badge-${statusConfig.color}`} style={{ fontSize: 10 }}>
              {statusConfig.label}
            </span>
            {isLocked && (
              <span style={{ marginLeft: 8, fontSize: 12, color: "var(--text-tertiary)" }}>
                🔒 Locked
              </span>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {canEdit && goals.length < 8 && (
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              + Add Goal
            </button>
          )}
          {canSubmit && (
            <button
              className="btn btn-violet"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit for Approval"}
            </button>
          )}
        </div>
      </div>

      {/* Return Note */}
      {goalSheet?.status === "RETURNED" && goalSheet?.returnNote && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: "12px 16px",
            background: "var(--accent-rose-dim)",
            border: "1px solid rgba(255,92,138,0.2)",
            borderRadius: "var(--radius-md)",
            marginBottom: 16,
            fontSize: 13,
            color: "var(--accent-rose)",
          }}
        >
          <strong>Manager feedback:</strong> {goalSheet.returnNote}
        </motion.div>
      )}

      {/* Weightage Bar */}
      {goals.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card"
          style={{ padding: 16, marginBottom: 16 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              Weightage Allocation
            </span>
            <span
              style={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                color:
                  totalWeightage === 100
                    ? "var(--accent-teal)"
                    : totalWeightage > 100
                    ? "var(--accent-rose)"
                    : "var(--accent-amber)",
              }}
            >
              {totalWeightage}% / 100%
            </span>
          </div>
          <div className="weightage-bar">
            <div
              className={`weightage-bar-fill ${totalWeightage > 100 ? "weightage-bar-overflow" : ""}`}
              style={{ width: `${Math.min(totalWeightage, 100)}%` }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
              {goals.length}/8 goals
            </span>
            {totalWeightage < 100 && (
              <span style={{ fontSize: 11, color: "var(--accent-amber)" }}>
                {100 - totalWeightage}% remaining
              </span>
            )}
            {totalWeightage === 100 && (
              <span style={{ fontSize: 11, color: "var(--accent-teal)" }}>✓ Ready to submit</span>
            )}
          </div>
        </motion.div>
      )}

      {error && (
        <div
          style={{
            padding: "10px 14px",
            background: "var(--accent-rose-dim)",
            border: "1px solid rgba(255,92,138,0.2)",
            borderRadius: "var(--radius-md)",
            marginBottom: 16,
            fontSize: 13,
            color: "var(--accent-rose)",
          }}
        >
          {error}
        </div>
      )}

      {/* Goal Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <AnimatePresence>
          {goals.map((goal: any, i: number) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              index={i}
              canEdit={canEdit}
              onDelete={async () => {
                await deleteGoal(goal.id);
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {goals.length === 0 && (
        <div className="empty-state glass-card" style={{ marginTop: 16 }}>
          <div className="empty-state-icon" style={{ fontSize: 24 }}>◎</div>
          <div className="empty-state-title">No Goals Created</div>
          <div className="empty-state-desc">
            Start building your goal sheet by adding your first goal.
          </div>
          {canEdit && (
            <button
              className="btn btn-primary"
              style={{ marginTop: 16 }}
              onClick={() => setShowForm(true)}
            >
              + Create First Goal
            </button>
          )}
        </div>
      )}

      {/* Create Goal Modal */}
      <AnimatePresence>
        {showForm && goalSheet && (
          <CreateGoalModal
            goalSheetId={goalSheet.id}
            currentWeightage={totalWeightage}
            goalCount={goals.length}
            onClose={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function GoalCard({
  goal,
  index,
  canEdit,
  onDelete,
}: {
  goal: any;
  index: number;
  canEdit: boolean;
  onDelete: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const statusColors: Record<string, string> = {
    NOT_STARTED: "rose",
    ON_TRACK: "violet",
    COMPLETED: "teal",
  };

  return (
    <motion.div
      className="glass-card"
      style={{ padding: 16 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="chip chip-blue" style={{ fontSize: 10, padding: "2px 8px" }}>
              {goal.thrustArea}
            </span>
            <span
              className={`chip chip-${statusColors[goal.status] || "gray"}`}
              style={{ fontSize: 10, padding: "2px 8px" }}
            >
              <span
                className={`status-dot status-dot-${statusColors[goal.status] || "gray"}`}
                style={{ width: 6, height: 6 }}
              />
              {goal.status === "NOT_STARTED" ? "Not Started" : goal.status === "ON_TRACK" ? "On Track" : "Completed"}
            </span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{goal.title}</div>
          {goal.description && (
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
              {goal.description}
            </div>
          )}
          <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text-tertiary)" }}>
            <span>
              <strong style={{ color: "var(--text-secondary)" }}>UoM:</strong>{" "}
              {UOM_LABELS[goal.uom] || goal.uom}
            </span>
            <span>
              <strong style={{ color: "var(--text-secondary)" }}>Target:</strong>{" "}
              <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {goal.uom === "TIMELINE" && goal.targetDate
                  ? new Date(goal.targetDate).toLocaleDateString()
                  : goal.target}
              </span>
            </span>
          </div>
        </div>

        <div style={{ textAlign: "right", minWidth: 70 }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              color: "var(--accent-teal)",
            }}
          >
            {goal.weightage}%
          </div>
          <div style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase" }}>
            Weightage
          </div>
          {canEdit && (
            <button
              className="btn btn-danger btn-sm"
              style={{ marginTop: 8 }}
              disabled={deleting}
              onClick={async () => {
                setDeleting(true);
                await onDelete();
              }}
            >
              {deleting ? "..." : "Remove"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function CreateGoalModal({
  goalSheetId,
  currentWeightage,
  goalCount,
  onClose,
}: {
  goalSheetId: string;
  currentWeightage: number;
  goalCount: number;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    thrustArea: THRUST_AREAS[0],
    title: "",
    description: "",
    uom: "NUMERIC_MIN",
    target: 0,
    targetDate: "",
    weightage: Math.min(100 - currentWeightage, 25),
  });

  const maxWeightage = 100 - currentWeightage;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.weightage < 10) {
      setError("Minimum weightage is 10%");
      return;
    }
    if (form.weightage > maxWeightage) {
      setError(`Maximum available weightage is ${maxWeightage}%`);
      return;
    }
    if (!form.title.trim()) {
      setError("Goal title is required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await createGoal({
        goalSheetId,
        thrustArea: form.thrustArea,
        title: form.title,
        description: form.description,
        uom: form.uom,
        target: form.target,
        targetDate: form.targetDate || undefined,
        weightage: form.weightage,
      });
      onClose();
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal"
        style={{ maxWidth: 600 }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Create New Goal</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Thrust Area */}
            <div>
              <label className="label">Thrust Area</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {THRUST_AREAS.map((area) => (
                  <button
                    key={area}
                    type="button"
                    className={`chip ${form.thrustArea === area ? "chip-active" : ""}`}
                    onClick={() => setForm({ ...form, thrustArea: area })}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="label">Goal Title *</label>
              <input
                className="input"
                placeholder="e.g., Increase Monthly Revenue"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="label">Description</label>
              <textarea
                className="textarea"
                placeholder="Describe your goal..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </div>

            {/* UoM */}
            <div>
              <label className="label">Unit of Measurement</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {Object.entries(UOM_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`chip ${form.uom === key ? "chip-active" : ""}`}
                    onClick={() => setForm({ ...form, uom: key })}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target */}
            {form.uom === "TIMELINE" ? (
              <div>
                <label className="label">Target Completion Date</label>
                <input
                  type="date"
                  className="input"
                  value={form.targetDate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      targetDate: e.target.value,
                      target: new Date(e.target.value).getTime(),
                    })
                  }
                  required
                />
              </div>
            ) : form.uom === "ZERO" ? (
              <div>
                <label className="label">Target</label>
                <input className="input" value="Zero (0)" disabled />
                <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>
                  Success = achieving zero for this metric
                </p>
              </div>
            ) : (
              <div>
                <label className="label">
                  Target {form.uom.includes("PERCENTAGE") ? "(%)" : "(Numeric)"}
                </label>
                <input
                  type="number"
                  className="input"
                  placeholder="Enter target value"
                  value={form.target || ""}
                  onChange={(e) =>
                    setForm({ ...form, target: parseFloat(e.target.value) || 0 })
                  }
                  required
                  min={0}
                />
              </div>
            )}

            {/* Weightage */}
            <div>
              <label className="label">
                Weightage (%) — Available: {maxWeightage}%
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input
                  type="range"
                  min={10}
                  max={Math.max(maxWeightage, 10)}
                  value={form.weightage}
                  onChange={(e) =>
                    setForm({ ...form, weightage: parseInt(e.target.value) })
                  }
                  style={{ flex: 1, accentColor: "var(--accent-teal)" }}
                />
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--accent-teal)",
                    minWidth: 50,
                    textAlign: "right",
                  }}
                >
                  {form.weightage}%
                </span>
              </div>
              {form.weightage < 10 && (
                <p style={{ fontSize: 11, color: "var(--accent-rose)", marginTop: 4 }}>
                  Minimum weightage is 10%
                </p>
              )}
            </div>

            {/* Preview Bar */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>After adding this goal</span>
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: "'JetBrains Mono', monospace",
                    color:
                      currentWeightage + form.weightage === 100
                        ? "var(--accent-teal)"
                        : currentWeightage + form.weightage > 100
                        ? "var(--accent-rose)"
                        : "var(--text-secondary)",
                  }}
                >
                  {currentWeightage + form.weightage}% / 100%
                </span>
              </div>
              <div className="weightage-bar">
                <div
                  className={`weightage-bar-fill ${currentWeightage + form.weightage > 100 ? "weightage-bar-overflow" : ""}`}
                  style={{ width: `${Math.min(currentWeightage + form.weightage, 100)}%` }}
                />
              </div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>
                {goalCount + 1}/8 goals
              </div>
            </div>

            {error && (
              <div
                style={{
                  padding: "8px 12px",
                  background: "var(--accent-rose-dim)",
                  border: "1px solid rgba(255,92,138,0.2)",
                  borderRadius: "var(--radius-md)",
                  fontSize: 12,
                  color: "var(--accent-rose)",
                }}
              >
                {error}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Goal"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
