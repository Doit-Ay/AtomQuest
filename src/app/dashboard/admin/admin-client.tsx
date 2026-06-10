"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { unlockGoalSheet } from "@/actions/goals";
import {
  createCycle,
  closeCycle,
  activateCycle,
  createUser,
  updateUser,
} from "@/actions/admin";
import { getInitials } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function AdminClient({
  cycles,
  users,
  lockedSheets,
}: {
  cycles: any[];
  users: any[];
  lockedSheets: any[];
}) {
  const [unlocking, setUnlocking] = useState("");
  const [showCycleForm, setShowCycleForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const [cycleForm, setCycleForm] = useState({
    name: "",
    year: new Date().getFullYear(),
    startDate: "",
    endDate: "",
  });

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "password123",
    role: "EMPLOYEE",
    department: "Engineering",
    managerId: "",
  });

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const handleUnlock = async (id: string) => {
    setUnlocking(id);
    await unlockGoalSheet(id);
    flash("Goal sheet unlocked");
    setUnlocking("");
  };

  const handleCreateCycle = async () => {
    if (!cycleForm.name || !cycleForm.startDate || !cycleForm.endDate) return;
    setLoading(true);
    try {
      await createCycle(cycleForm);
      flash("Cycle created successfully");
      setShowCycleForm(false);
      setCycleForm({ name: "", year: new Date().getFullYear(), startDate: "", endDate: "" });
    } catch (e: any) {
      alert(e.message);
    }
    setLoading(false);
  };

  const handleToggleCycle = async (cycleId: string, status: string) => {
    setLoading(true);
    try {
      if (status === "ACTIVE") {
        await closeCycle(cycleId);
        flash("Cycle closed");
      } else {
        await activateCycle(cycleId);
        flash("Cycle activated");
      }
    } catch (e: any) {
      alert(e.message);
    }
    setLoading(false);
  };

  const handleCreateUser = async () => {
    if (!userForm.name || !userForm.email) return;
    setLoading(true);
    try {
      await createUser(userForm);
      flash("User created successfully");
      setShowUserForm(false);
      setUserForm({
        name: "", email: "", password: "password123",
        role: "EMPLOYEE", department: "Engineering", managerId: "",
      });
    } catch (e: any) {
      alert(e.message);
    }
    setLoading(false);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    setLoading(true);
    try {
      await updateUser(editingUser.id, {
        name: editingUser.name,
        role: editingUser.role,
        department: editingUser.department,
        managerId: editingUser.managerId || null,
      });
      flash("User updated");
      setEditingUser(null);
    } catch (e: any) {
      alert(e.message);
    }
    setLoading(false);
  };

  const managers = users.filter((u) => u.role === "MANAGER" || u.role === "ADMIN");

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-subtitle">Manage cycles, users, and system settings</p>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="glass-card"
            style={{
              padding: "10px 20px",
              marginBottom: 16,
              borderLeft: "3px solid var(--accent-teal)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
            }}
          >
            <span style={{ color: "var(--accent-teal)" }}>✓</span> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cycles ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 28 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Performance Cycles</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCycleForm(!showCycleForm)}>
            {showCycleForm ? "Cancel" : "+ New Cycle"}
          </button>
        </div>

        <AnimatePresence>
          {showCycleForm && (
            <motion.div
              className="glass-card"
              style={{ padding: 20, marginBottom: 16 }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label className="label">Cycle Name</label>
                  <input
                    className="input"
                    placeholder="FY 2027-28"
                    value={cycleForm.name}
                    onChange={(e) => setCycleForm({ ...cycleForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Year</label>
                  <input
                    className="input"
                    type="number"
                    value={cycleForm.year}
                    onChange={(e) => setCycleForm({ ...cycleForm, year: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Start Date</label>
                  <input
                    className="input"
                    type="date"
                    value={cycleForm.startDate}
                    onChange={(e) => setCycleForm({ ...cycleForm, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">End Date</label>
                  <input
                    className="input"
                    type="date"
                    value={cycleForm.endDate}
                    onChange={(e) => setCycleForm({ ...cycleForm, endDate: e.target.value })}
                  />
                </div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleCreateCycle} disabled={loading}>
                {loading ? "Creating..." : "Create Cycle"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {cycles.map((cycle) => (
            <div key={cycle.id} className="glass-card" style={{ padding: 16, minWidth: 240, flex: "1 1 240px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{cycle.name}</span>
                <span className={`badge badge-${cycle.status === "ACTIVE" ? "teal" : "gray"}`}>
                  {cycle.status}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 10 }}>
                {new Date(cycle.startDate).toLocaleDateString()} — {new Date(cycle.endDate).toLocaleDateString()}
              </div>
              <button
                className={`btn btn-sm ${cycle.status === "ACTIVE" ? "btn-ghost" : "btn-primary"}`}
                onClick={() => handleToggleCycle(cycle.id, cycle.status)}
                disabled={loading}
                style={{ fontSize: 11 }}
              >
                {cycle.status === "ACTIVE" ? "Close Cycle" : "Activate"}
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Users ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: 28 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Users ({users.length})</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setShowUserForm(!showUserForm)}>
            {showUserForm ? "Cancel" : "+ Add User"}
          </button>
        </div>

        <AnimatePresence>
          {showUserForm && (
            <motion.div
              className="glass-card"
              style={{ padding: 20, marginBottom: 16 }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label className="label">Name</label>
                  <input
                    className="input"
                    placeholder="Full Name"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    className="input"
                    placeholder="user@atomquest.dev"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input
                    className="input"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label className="label">Role</label>
                  <select
                    className="select"
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="label">Department</label>
                  <select
                    className="select"
                    value={userForm.department}
                    onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                  >
                    <option>Engineering</option>
                    <option>Human Resources</option>
                    <option>Marketing</option>
                    <option>Sales</option>
                    <option>Finance</option>
                    <option>Operations</option>
                  </select>
                </div>
                <div>
                  <label className="label">Manager</label>
                  <select
                    className="select"
                    value={userForm.managerId}
                    onChange={(e) => setUserForm({ ...userForm, managerId: e.target.value })}
                  >
                    <option value="">None</option>
                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                    ))}
                  </select>
                </div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleCreateUser} disabled={loading}>
                {loading ? "Creating..." : "Create User"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Manager</th>
                <th style={{ width: 80 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="avatar" style={{ width: 26, height: 26, fontSize: 10 }}>
                        {getInitials(user.name)}
                      </div>
                      <span style={{ fontWeight: 500 }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>{user.email}</td>
                  <td>
                    <span className={`badge badge-${user.role === "ADMIN" ? "amber" : user.role === "MANAGER" ? "violet" : "teal"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>{user.department}</td>
                  <td style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                    {user.manager?.name || "—"}
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 11 }}
                      onClick={() =>
                        setEditingUser({
                          id: user.id,
                          name: user.name,
                          role: user.role,
                          department: user.department,
                          managerId: user.managerId || "",
                        })
                      }
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── Edit User Modal ── */}
      <AnimatePresence>
        {editingUser && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setEditingUser(null);
            }}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ maxWidth: 460 }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Edit User</h3>
              <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
                <div>
                  <label className="label">Name</label>
                  <input
                    className="input"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label className="label">Role</label>
                    <select
                      className="select"
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    >
                      <option value="EMPLOYEE">Employee</option>
                      <option value="MANAGER">Manager</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Department</label>
                    <select
                      className="select"
                      value={editingUser.department}
                      onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                    >
                      <option>Engineering</option>
                      <option>Human Resources</option>
                      <option>Marketing</option>
                      <option>Sales</option>
                      <option>Finance</option>
                      <option>Operations</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Manager</label>
                  <select
                    className="select"
                    value={editingUser.managerId}
                    onChange={(e) => setEditingUser({ ...editingUser, managerId: e.target.value })}
                  >
                    <option value="">None</option>
                    {managers
                      .filter((m) => m.id !== editingUser.id)
                      .map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditingUser(null)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={handleUpdateUser} disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Locked Sheets ── */}
      {lockedSheets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
            Locked Goal Sheets ({lockedSheets.length})
          </h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {lockedSheets.map((gs) => (
                  <tr key={gs.id}>
                    <td style={{ fontWeight: 500 }}>{gs.user.name}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{gs.user.department}</td>
                    <td>
                      <span className="badge badge-teal">{gs.status}</span>
                      <span style={{ marginLeft: 6, fontSize: 11, color: "var(--text-tertiary)" }}>
                        🔒 Locked
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleUnlock(gs.id)}
                        disabled={unlocking === gs.id}
                      >
                        {unlocking === gs.id ? "Unlocking..." : "Unlock"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
