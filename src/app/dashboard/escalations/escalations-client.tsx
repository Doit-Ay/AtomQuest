"use client";

import { motion } from "framer-motion";
import { resolveEscalation } from "@/actions/escalations";
import { useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

const SEVERITY_CONFIG = {
  high: { label: "High", color: "rose", icon: "🔴" },
  medium: { label: "Medium", color: "amber", icon: "🟡" },
  low: { label: "Low", color: "teal", icon: "🟢" },
};

export function EscalationsClient({
  rules,
  escalations,
}: {
  rules: any[];
  escalations: any[];
}) {
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const [resolving, setResolving] = useState("");

  const handleResolve = async (emp: string, type: string) => {
    const key = `${emp}-${type}`;
    setResolving(key);
    await resolveEscalation(emp, type);
    setResolved((prev) => new Set(prev).add(key));
    setResolving("");
  };

  const activeEscalations = escalations.filter(
    (e) => !resolved.has(`${e.employee}-${e.type}`)
  );
  const highCount = activeEscalations.filter((e) => e.severity === "high").length;
  const mediumCount = activeEscalations.filter((e) => e.severity === "medium").length;
  const lowCount = activeEscalations.filter((e) => e.severity === "low").length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Escalations</h1>
          <p className="page-subtitle">
            Rule-based compliance monitoring & auto-escalation
          </p>
        </div>
        {activeEscalations.length > 0 && (
          <div
            className="badge badge-rose"
            style={{ fontSize: 12, padding: "6px 14px" }}
          >
            {activeEscalations.length} Active
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          { label: "High Priority", count: highCount, color: "var(--accent-rose)", bg: "var(--accent-rose-dim)" },
          { label: "Medium Priority", count: mediumCount, color: "var(--accent-amber)", bg: "var(--accent-amber-dim)" },
          { label: "Low Priority", count: lowCount, color: "var(--accent-teal)", bg: "var(--accent-teal-dim)" },
        ].map((item) => (
          <motion.div
            key={item.label}
            className="glass-card"
            style={{ padding: 16, textAlign: "center" }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div style={{ fontSize: 11, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
              {item.label}
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                color: item.color,
              }}
            >
              {item.count}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Active Escalations */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: 24 }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
          Active Escalations
        </h2>
        {activeEscalations.length === 0 ? (
          <div className="glass-card" style={{ padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
            <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>
              No active escalations — all clear!
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Type</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Days Overdue</th>
                  <th>Action</th>
                  <th style={{ width: 80 }}></th>
                </tr>
              </thead>
              <tbody>
                {activeEscalations.map((esc, i) => {
                  const sev = SEVERITY_CONFIG[esc.severity as keyof typeof SEVERITY_CONFIG];
                  const key = `${esc.employee}-${esc.type}`;
                  return (
                    <tr key={i}>
                      <td>
                        <span className={`badge badge-${sev.color}`} style={{ fontSize: 10 }}>
                          {sev.icon} {sev.label}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500, fontSize: 13 }}>{esc.type}</td>
                      <td>{esc.employee}</td>
                      <td style={{ color: "var(--text-secondary)" }}>{esc.department}</td>
                      <td>
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 13,
                            fontWeight: 600,
                            color: esc.daysOverdue > 14
                              ? "var(--accent-rose)"
                              : esc.daysOverdue > 7
                              ? "var(--accent-amber)"
                              : "var(--text-primary)",
                          }}
                        >
                          +{esc.daysOverdue}d
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                        {esc.action}
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: 11 }}
                          onClick={() => handleResolve(esc.employee, esc.type)}
                          disabled={resolving === key}
                        >
                          {resolving === key ? "..." : "Resolve"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Escalation Rules */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
          Escalation Rules
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {rules.map((rule, i) => (
            <div key={i} className="glass-card" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{rule.name}</span>
                <span
                  className={`badge badge-${rule.isActive ? "teal" : "gray"}`}
                  style={{ fontSize: 9 }}
                >
                  {rule.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6 }}>
                Trigger: <strong>{rule.triggerDays} days</strong> after due date
              </div>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                Action: {rule.action.replace("_", " ").toLowerCase()}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
