"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createSharedGoal } from "@/actions/shared-goals";
import { UOM_LABELS, THRUST_AREAS } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface Recipient {
  id: string;
  name: string;
  email: string;
  department: string;
}

export function SharedGoalsClient({ recipients }: { recipients: Recipient[] }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [form, setForm] = useState({
    thrustArea: "",
    title: "",
    description: "",
    uom: "NUMERIC_MIN",
    target: 0,
    targetDate: "",
    defaultWeightage: 15,
  });

  const toggleRecipient = (id: string) => {
    setSelectedRecipients((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedRecipients.length === recipients.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(recipients.map((r) => r.id));
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.thrustArea || selectedRecipients.length === 0) return;
    setLoading(true);
    try {
      const results = await createSharedGoal({
        ...form,
        recipientIds: selectedRecipients,
      });
      setSuccess(
        `Shared goal pushed to ${results.length} employee${results.length > 1 ? "s" : ""}!`
      );
      setShowForm(false);
      setForm({
        thrustArea: "",
        title: "",
        description: "",
        uom: "NUMERIC_MIN",
        target: 0,
        targetDate: "",
        defaultWeightage: 15,
      });
      setSelectedRecipients([]);
      setTimeout(() => setSuccess(""), 4000);
    } catch (e: any) {
      alert(e.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Shared Goals</h1>
          <p className="page-subtitle">
            Push organization-wide goals to team members
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Create Shared Goal"}
        </button>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="glass-card"
            style={{
              padding: "12px 20px",
              marginBottom: 16,
              borderLeft: "3px solid var(--accent-teal)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ color: "var(--accent-teal)", fontSize: 16 }}>✓</span>
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Creation Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="glass-card"
            style={{ padding: 24, marginBottom: 20 }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>
              Define Shared Goal
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 16,
              }}
            >
              <div>
                <label className="label">Thrust Area</label>
                <select
                  className="select"
                  value={form.thrustArea}
                  onChange={(e) =>
                    setForm({ ...form, thrustArea: e.target.value })
                  }
                >
                  <option value="">Select thrust area</option>
                  {THRUST_AREAS.map((ta) => (
                    <option key={ta} value={ta}>
                      {ta}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Unit of Measurement</label>
                <select
                  className="select"
                  value={form.uom}
                  onChange={(e) => setForm({ ...form, uom: e.target.value })}
                >
                  {Object.entries(UOM_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="label">Goal Title</label>
              <input
                className="input"
                placeholder="e.g. Achieve Zero Customer Complaints"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="label">Description</label>
              <textarea
                className="textarea"
                placeholder="Goal description..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={2}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 16,
                marginBottom: 20,
              }}
            >
              <div>
                <label className="label">Target</label>
                <input
                  className="input"
                  type="number"
                  value={form.target || ""}
                  onChange={(e) =>
                    setForm({ ...form, target: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              {form.uom === "TIMELINE" && (
                <div>
                  <label className="label">Target Date</label>
                  <input
                    className="input"
                    type="date"
                    value={form.targetDate}
                    onChange={(e) =>
                      setForm({ ...form, targetDate: e.target.value })
                    }
                  />
                </div>
              )}
              <div>
                <label className="label">Default Weightage (%)</label>
                <input
                  className="input"
                  type="number"
                  min={10}
                  max={25}
                  value={form.defaultWeightage}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      defaultWeightage: parseInt(e.target.value) || 15,
                    })
                  }
                />
              </div>
            </div>

            {/* Recipient Selection */}
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <label className="label" style={{ margin: 0 }}>
                  Recipients ({selectedRecipients.length} / {recipients.length})
                </label>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={selectAll}
                >
                  {selectedRecipients.length === recipients.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {recipients.map((r) => {
                  const selected = selectedRecipients.includes(r.id);
                  return (
                    <button
                      key={r.id}
                      className={`chip ${selected ? "chip-active" : ""}`}
                      onClick={() => toggleRecipient(r.id)}
                      style={{
                        padding: "6px 14px",
                        fontSize: 13,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 4,
                          border: selected
                            ? "2px solid var(--accent-teal)"
                            : "2px solid var(--border-default)",
                          background: selected
                            ? "var(--accent-teal)"
                            : "transparent",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          color: selected ? "#0A0D14" : "transparent",
                          flexShrink: 0,
                        }}
                      >
                        ✓
                      </span>
                      {r.name}
                      <span
                        style={{
                          fontSize: 10,
                          color: "var(--text-tertiary)",
                        }}
                      >
                        {r.department}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preview + Submit */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                {selectedRecipients.length > 0 ? (
                  <>
                    Will push <strong>{form.title || "goal"}</strong> with{" "}
                    <strong>{form.defaultWeightage}%</strong> weightage to{" "}
                    <strong>{selectedRecipients.length}</strong> employee
                    {selectedRecipients.length > 1 ? "s" : ""}
                  </>
                ) : (
                  "Select at least one recipient"
                )}
              </div>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={
                  loading ||
                  !form.title.trim() ||
                  !form.thrustArea ||
                  selectedRecipients.length === 0
                }
              >
                {loading
                  ? "Pushing..."
                  : `Push to ${selectedRecipients.length} Employee${selectedRecipients.length > 1 ? "s" : ""}`}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Card */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
          How Shared Goals Work
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[
            {
              step: "1",
              title: "Define the Goal",
              desc: "Set title, target, UoM, and default weightage for the shared goal.",
            },
            {
              step: "2",
              title: "Select Recipients",
              desc: "Choose team members who should have this goal on their sheet.",
            },
            {
              step: "3",
              title: "Push & Notify",
              desc: "Goal appears on selected sheets. Recipients can adjust weightage only.",
            },
          ].map((item) => (
            <div key={item.step} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-full)",
                  background: "var(--accent-violet-dim)",
                  color: "var(--accent-violet)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 15,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                {item.step}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                {item.title}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
