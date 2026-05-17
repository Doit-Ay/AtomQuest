"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const DEMO_ACCOUNTS = [
  {
    role: "Employee",
    email: "employee@atmoquest.dev",
    name: "Aditya Singh",
    dept: "Engineering",
    color: "teal",
  },
  {
    role: "Manager",
    email: "manager@atmoquest.dev",
    name: "Rajesh Kumar",
    dept: "Engineering",
    color: "violet",
  },
  {
    role: "Admin",
    email: "admin@atmoquest.dev",
    name: "Priya Sharma",
    dept: "Human Resources",
    color: "amber",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"quick" | "manual">("quick");

  const handleQuickLogin = async (accountEmail: string, role: string) => {
    setLoading(true);
    setSelectedRole(role);
    setError("");

    const result = await signIn("credentials", {
      email: accountEmail,
      password: "password123",
      redirect: false,
    });

    if (result?.error) {
      setError("Login failed. Please try again.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-effects">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />
      </div>

      <motion.div
        className="login-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Logo & Title */}
        <div className="login-header">
          <div className="login-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="12" fill="url(#logo-grad)" />
              <path
                d="M12 20L17 14L23 22L28 16"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="28" cy="16" r="2.5" fill="white" />
              <defs>
                <linearGradient id="logo-grad" x1="0" y1="0" x2="40" y2="40">
                  <stop stopColor="#7C5CFC" />
                  <stop offset="1" stopColor="#00D4AA" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="login-title">AtmoQuest</h1>
          <p className="login-subtitle">Goal Setting & Tracking Portal</p>
        </div>

        {/* Mode Toggle */}
        <div className="login-mode-toggle">
          <button
            className={`login-mode-btn ${mode === "quick" ? "login-mode-btn-active" : ""}`}
            onClick={() => setMode("quick")}
          >
            Quick Login
          </button>
          <button
            className={`login-mode-btn ${mode === "manual" ? "login-mode-btn-active" : ""}`}
            onClick={() => setMode("manual")}
          >
            Email Login
          </button>
        </div>

        {/* Microsoft SSO */}
        <button
          className="login-microsoft-btn"
          onClick={() => signIn("microsoft-entra-id", { callbackUrl: "/dashboard" })}
          disabled={loading}
        >
          <svg width="20" height="20" viewBox="0 0 21 21">
            <rect x="1" y="1" width="9" height="9" fill="#F25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
            <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
          </svg>
          Sign in with Microsoft
        </button>

        <div className="login-divider">
          <span>or use demo accounts</span>
        </div>

        <AnimatePresence mode="wait">
          {mode === "quick" ? (
            <motion.div
              key="quick"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Quick Login Cards */}
              <div className="login-roles">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.role}
                    className={`login-role-card login-role-${account.color}`}
                    onClick={() => handleQuickLogin(account.email, account.role)}
                    disabled={loading}
                  >
                    <div className="login-role-header">
                      <div className={`avatar avatar-lg`}>
                        {account.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="login-role-name">{account.role}</div>
                        <div className="login-role-user">{account.name}</div>
                      </div>
                    </div>
                    <div className="login-role-dept">{account.dept}</div>
                    {loading && selectedRole === account.role && (
                      <div className="login-role-loading">
                        <div className="login-spinner" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="manual"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Manual Login Form */}
              <form onSubmit={handleManualLogin} className="login-form">
                <div className="login-field">
                  <label className="label">Email</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="login-field">
                  <label className="label">Password</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={loading}
                  style={{ width: "100%" }}
                >
                  {loading ? (
                    <div className="login-spinner" />
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            className="login-error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        <div className="login-footer">
          <span>AtomQuest Hackathon 1.0</span>
          <span>•</span>
          <span>All passwords: <code>password123</code></span>
        </div>
      </motion.div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: var(--bg-primary);
        }

        .login-bg-effects {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .login-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.15;
        }

        .login-orb-1 {
          width: 500px;
          height: 500px;
          background: var(--accent-teal);
          top: -200px;
          right: -100px;
        }

        .login-orb-2 {
          width: 400px;
          height: 400px;
          background: var(--accent-violet);
          bottom: -150px;
          left: -100px;
        }

        .login-orb-3 {
          width: 300px;
          height: 300px;
          background: var(--accent-amber);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.05;
        }

        .login-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
          padding: 40px;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          backdrop-filter: blur(24px);
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
        }

        .login-title {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, var(--accent-violet), var(--accent-teal));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 4px;
        }

        .login-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .login-mode-toggle {
          display: flex;
          background: var(--bg-primary);
          border-radius: var(--radius-md);
          padding: 3px;
          margin-bottom: 24px;
          border: 1px solid var(--border-subtle);
        }

        .login-mode-btn {
          flex: 1;
          padding: 8px;
          font-size: 13px;
          font-weight: 500;
          font-family: inherit;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          border-radius: 7px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .login-mode-btn-active {
          background: var(--bg-elevated);
          color: var(--text-primary);
          box-shadow: var(--shadow-sm);
        }

        .login-roles {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .login-role-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          background: var(--bg-primary);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          font-family: inherit;
          text-align: left;
          position: relative;
          overflow: hidden;
        }

        .login-role-card:hover:not(:disabled) {
          border-color: var(--border-default);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        .login-role-card:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .login-role-teal:hover:not(:disabled) {
          border-color: rgba(0, 212, 170, 0.3);
          box-shadow: 0 4px 20px rgba(0, 212, 170, 0.1);
        }

        .login-role-violet:hover:not(:disabled) {
          border-color: rgba(124, 92, 252, 0.3);
          box-shadow: 0 4px 20px rgba(124, 92, 252, 0.1);
        }

        .login-role-amber:hover:not(:disabled) {
          border-color: rgba(255, 181, 71, 0.3);
          box-shadow: 0 4px 20px rgba(255, 181, 71, 0.1);
        }

        .login-role-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .login-role-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .login-role-user {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .login-role-dept {
          font-size: 11px;
          color: var(--text-tertiary);
          padding: 3px 8px;
          background: var(--bg-elevated);
          border-radius: var(--radius-full);
        }

        .login-role-loading {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(15, 18, 25, 0.7);
          backdrop-filter: blur(4px);
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .login-field {
          display: flex;
          flex-direction: column;
        }

        .login-error {
          margin-top: 16px;
          padding: 10px 14px;
          font-size: 13px;
          color: var(--accent-rose);
          background: var(--accent-rose-dim);
          border-radius: var(--radius-md);
          border: 1px solid rgba(255, 92, 138, 0.2);
          text-align: center;
        }

        .login-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 24px;
          font-size: 11px;
          color: var(--text-tertiary);
        }

        .login-footer code {
          font-family: 'JetBrains Mono', monospace;
          padding: 1px 5px;
          background: var(--bg-elevated);
          border-radius: 3px;
          color: var(--text-secondary);
        }

        .login-microsoft-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 12px;
          font-size: 14px;
          font-weight: 500;
          font-family: inherit;
          color: var(--text-primary);
          background: linear-gradient(135deg, rgba(0, 164, 239, 0.08), rgba(127, 186, 0, 0.08));
          border: 1px solid rgba(0, 164, 239, 0.25);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          margin-bottom: 0;
        }

        .login-microsoft-btn:hover:not(:disabled) {
          border-color: rgba(0, 164, 239, 0.5);
          box-shadow: 0 4px 20px rgba(0, 164, 239, 0.15);
          transform: translateY(-1px);
        }

        .login-microsoft-btn:disabled {
          opacity: 0.5;
          cursor: wait;
        }

        .login-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 16px 0;
          color: var(--text-tertiary);
          font-size: 12px;
        }

        .login-divider::before,
        .login-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border-subtle);
        }

        .login-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid var(--border-default);
          border-top-color: var(--accent-teal);
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
