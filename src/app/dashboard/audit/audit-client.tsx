"use client";

import { useState } from "react";
import { motion } from "framer-motion";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function AuditClient({ logs }: { logs: any[] }) {
  const [filter, setFilter] = useState("");

  const filtered = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(filter.toLowerCase()) ||
      log.entityType.toLowerCase().includes(filter.toLowerCase()) ||
      log.user.name.toLowerCase().includes(filter.toLowerCase())
  );

  const actionColors: Record<string, string> = {
    CREATED: "teal",
    UPDATED: "blue",
    APPROVED: "violet",
    RETURNED: "amber",
    DELETED: "rose",
    UNLOCKED: "amber",
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Log</h1>
          <p className="page-subtitle">{logs.length} events recorded</p>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input
          className="input"
          placeholder="Filter by user, action, or entity..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ maxWidth: 400 }}
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Changes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log, i) => (
              <motion.tr
                key={log.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <td style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-tertiary)" }}>
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="avatar" style={{ width: 24, height: 24, fontSize: 10 }}>
                      {log.user.name.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    <span style={{ fontSize: 13 }}>{log.user.name}</span>
                  </div>
                </td>
                <td>
                  <span className={`badge badge-${actionColors[log.action] || "gray"}`}>
                    {log.action}
                  </span>
                </td>
                <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  {log.entityType}
                  <div style={{ fontSize: 10, color: "var(--text-tertiary)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {log.entityId.slice(0, 12)}...
                  </div>
                </td>
                <td style={{ maxWidth: 300 }}>
                  <AuditDiff prev={log.previousValue} next={log.newValue} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AuditDiff({ prev, next }: { prev: string; next: string }) {
  try {
    const prevObj = JSON.parse(prev);
    const nextObj = JSON.parse(next);
    const allKeys = [...new Set([...Object.keys(prevObj), ...Object.keys(nextObj)])];

    return (
      <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
        {allKeys.map((key) => {
          const from = prevObj[key];
          const to = nextObj[key];
          if (from === to) return null;
          return (
            <div key={key} style={{ marginBottom: 2 }}>
              <span style={{ color: "var(--text-tertiary)" }}>{key}: </span>
              {from !== undefined && (
                <span style={{ color: "var(--accent-rose)", textDecoration: "line-through" }}>
                  {String(from)}
                </span>
              )}
              {from !== undefined && to !== undefined && <span> → </span>}
              {to !== undefined && (
                <span style={{ color: "var(--accent-teal)" }}>{String(to)}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  } catch {
    return <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>—</span>;
  }
}
