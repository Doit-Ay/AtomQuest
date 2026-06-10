"use client";

import { signIn } from "next-auth/react";
import { useState, CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const ACCOUNTS = [
  { role: "Employee", email: "employee@atomquest.dev", name: "Aditya Singh", dept: "Engineering", color: "#4F6EF7", initials: "AS" },
  { role: "Manager", email: "manager@atomquest.dev", name: "Rajesh Kumar", dept: "Engineering", color: "#7C5CFC", initials: "RK" },
  { role: "Admin", email: "admin@atomquest.dev", name: "Priya Sharma", dept: "Human Resources", color: "#00C9A7", initials: "PS" },
];

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"demo" | "email">("demo");

  const quickLogin = async (acc: typeof ACCOUNTS[0]) => {
    setLoading(true); setActiveRole(acc.role); setError("");
    const r = await signIn("credentials", { email: acc.email, password: "password123", redirect: false });
    if (r?.error) { setError("Login failed."); setLoading(false); } else router.push("/dashboard");
  };

  const manualLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    const r = await signIn("credentials", { email, password, redirect: false });
    if (r?.error) { setError("Invalid credentials."); setLoading(false); } else router.push("/dashboard");
  };

  return (
    <div className="lp-page">
      {/* ═══ LEFT PANEL ═══ */}
      <div className="lp-left">
        {/* Decorative shapes */}
        <div className="deco">
          <div className="deco-circle dc1" />
          <div className="deco-circle dc2" />
          <div className="deco-circle dc3" />
          <div className="deco-dots" />
          <div className="deco-ring dr1" />
          <div className="deco-ring dr2" />
          <div className="deco-globe" />
          <div className="deco-x">✕</div>
        </div>

        <motion.div className="lp-left-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="lp-hero-title">
            Performance<br />starts here
          </h1>
          <p className="lp-hero-sub">
            Track goals, drive results, and build a culture of continuous growth with AtomQuest.
          </p>

        </motion.div>
      </div>

      {/* ═══ RIGHT PANEL ═══ */}
      <div className="lp-right">
        {/* Background accent circles */}
        <div className="right-deco">
          <div className="rd rd1" />
          <div className="rd rd2" />
        </div>

        <motion.div className="lp-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
          {/* Logo */}
          <div className="lp-logo">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="14" fill="#4F6EF7" />
              <path d="M14 28L20 18L27 28L34 20" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="34" cy="20" r="2.5" fill="#fff" />
            </svg>
          </div>

          <h2 className="lp-welcome">Hello! Welcome back</h2>
          <p className="lp-welcome-sub">Sign in to access your AtomQuest dashboard</p>

          {/* Microsoft SSO */}
          <motion.button className="lp-ms-btn" onClick={() => signIn("microsoft-entra-id", { callbackUrl: "/dashboard" })} disabled={loading} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
            <svg width="18" height="18" viewBox="0 0 21 21"><rect x="1" y="1" width="9" height="9" fill="#F25022"/><rect x="11" y="1" width="9" height="9" fill="#7FBA00"/><rect x="1" y="11" width="9" height="9" fill="#00A4EF"/><rect x="11" y="11" width="9" height="9" fill="#FFB900"/></svg>
            Continue with Microsoft
          </motion.button>

          <div className="lp-divider"><span>or</span></div>

          {/* Tabs */}
          <div className="lp-tabs">
            <button className={`lp-tab ${tab === "demo" ? "active" : ""}`} onClick={() => setTab("demo")}>Demo Accounts</button>
            <button className={`lp-tab ${tab === "email" ? "active" : ""}`} onClick={() => setTab("email")}>Email Login</button>
          </div>

          <AnimatePresence mode="wait">
            {tab === "demo" ? (
              <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="lp-accounts">
                  {ACCOUNTS.map((a, i) => (
                    <motion.button key={a.role} className="lp-acc" onClick={() => quickLogin(a)} disabled={loading}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                      style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12 }}>
                      <div className="lp-acc-avatar" style={{ background: a.color }}>{a.initials}</div>
                      <div style={{ flex: 1, textAlign: "left" as const }}>
                        <div className="lp-acc-role">{a.role}</div>
                        <div className="lp-acc-detail">{a.name} · {a.dept}</div>
                      </div>
                      <span className="lp-acc-arrow" style={{ color: a.color }}>
                        {loading && activeRole === a.role ? <span className="lp-spinner" /> : "→"}
                      </span>
                    </motion.button>
                  ))}
                </div>
                <p className="lp-pw-hint">🔑 Password for all: <code>password123</code></p>
              </motion.div>
            ) : (
              <motion.form key="e" onSubmit={manualLogin} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="lp-field">
                  <label>Email</label>
                  <div className="lp-input-wrap">
                    <span className="lp-input-icon">✉</span>
                    <input type="email" placeholder="Enter your email address" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="lp-field">
                  <label>Password</label>
                  <div className="lp-input-wrap">
                    <span className="lp-input-icon">🔒</span>
                    <input type="password" placeholder="••••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>
                </div>
                <div className="lp-row" style={{ justifyContent: "space-between", marginBottom: 20 }}>
                  <label className="lp-check"><input type="checkbox" /> Remember me</label>
                  <a className="lp-link" href="#">Reset Password</a>
                </div>
                <motion.button type="submit" className="lp-submit" disabled={loading} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  {loading ? <span className="lp-spinner" /> : "Login"}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {error && <motion.p className="lp-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.p>}

          <div className="lp-footer">
            Built with Next.js 16 · Prisma · Azure AD
          </div>
        </motion.div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; }
        .lp-page { display: flex; min-height: 100vh; font-family: 'Inter', -apple-system, sans-serif; }

        /* ═══ LEFT ═══ */
        .lp-left { flex: 1; background: linear-gradient(160deg, #4F6EF7 0%, #5B78F9 40%, #3B5BDB 100%); position: relative; overflow: hidden; display: flex; align-items: center; padding: 60px; }

        /* Decorations */
        .deco { position: absolute; inset: 0; pointer-events: none; }
        .deco-circle { position: absolute; border-radius: 50%; }
        .dc1 { width: 200px; height: 200px; background: rgba(255,255,255,0.08); bottom: -40px; right: 30%; }
        .dc2 { width: 120px; height: 120px; background: rgba(255,255,255,0.06); bottom: 80px; right: 20%; }
        .dc3 { width: 30px; height: 30px; background: #00E5C3; bottom: 35%; left: 15%; box-shadow: 0 4px 20px rgba(0,229,195,0.4); }
        .deco-dots { position: absolute; top: 60px; left: 40px; width: 80px; height: 60px;
          background-image: radial-gradient(rgba(255,255,255,0.35) 2px, transparent 2px);
          background-size: 12px 12px; }
        .deco-ring { position: absolute; border-radius: 50%; border: 2px solid rgba(255,255,255,0.15); }
        .dr1 { width: 60px; height: 60px; top: 50px; right: 60px; }
        .dr2 { width: 40px; height: 40px; top: 80px; right: 80px; border-color: rgba(255,255,255,0.25); }
        .deco-globe { position: absolute; bottom: 40px; right: 50px; width: 160px; height: 160px; border-radius: 50%;
          background: linear-gradient(135deg, rgba(0,229,195,0.5), rgba(79,110,247,0.3));
          box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
        .deco-x { position: absolute; bottom: 40%; left: 10%; font-size: 20px; color: rgba(255,255,255,0.2); font-weight: 300; }

        /* Abstract shapes */
        .deco::before { content: ''; position: absolute; top: 40px; left: 120px; width: 40px; height: 80px;
          border: 3px solid rgba(255,255,255,0.2); border-radius: 0 0 20px 20px; border-top: none; }
        .deco::after { content: ''; position: absolute; top: 35px; left: 115px; width: 50px; height: 12px;
          background: rgba(255,255,255,0.15); border-radius: 6px 6px 0 0; }

        .lp-left-content { position: relative; z-index: 2; max-width: 420px; }
        .lp-hero-title { font-size: 46px; font-weight: 800; color: #fff; line-height: 1.15; letter-spacing: -0.03em; margin-bottom: 16px; }
        .lp-hero-sub { font-size: 15px; color: rgba(255,255,255,0.75); line-height: 1.7; margin-bottom: 28px; }
        .lp-hero-badge { display: inline-flex; padding: 8px 18px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); border-radius: 100px; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.9); }

        /* ═══ RIGHT ═══ */
        .lp-right { width: 520px; background: #FAFBFF; display: flex; align-items: center; justify-content: center; padding: 48px; position: relative; overflow: hidden; }
        .right-deco { position: absolute; inset: 0; pointer-events: none; }
        .rd { position: absolute; border-radius: 50%; }
        .rd1 { width: 300px; height: 300px; top: -120px; right: -100px; background: rgba(79,110,247,0.06); }
        .rd2 { width: 200px; height: 200px; bottom: -60px; right: -40px; background: rgba(79,110,247,0.04); }

        .lp-card { width: 100%; max-width: 400px; position: relative; z-index: 2; }
        .lp-logo { margin-bottom: 28px; }
        .lp-welcome { font-size: 24px; font-weight: 700; color: #1A1D26; margin-bottom: 6px; }
        .lp-welcome-sub { font-size: 14px; color: #8B8FA3; margin-bottom: 28px; }

        /* Microsoft Button */
        .lp-ms-btn { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 13px; font-size: 14px; font-weight: 600; font-family: inherit; color: #1A1D26; background: #fff; border: 1.5px solid #E2E5F1; border-radius: 12px; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .lp-ms-btn:hover:not(:disabled) { border-color: #4F6EF7; box-shadow: 0 4px 16px rgba(79,110,247,0.12); transform: translateY(-2px); }
        .lp-ms-btn:disabled { opacity: 0.5; cursor: wait; }

        /* Divider */
        .lp-divider { display: flex; align-items: center; gap: 16px; margin: 22px 0; font-size: 12px; color: #B0B5C3; }
        .lp-divider::before, .lp-divider::after { content: ''; flex: 1; height: 1px; background: #E8EAF0; }

        /* Tabs */
        .lp-tabs { display: flex; gap: 4px; margin-bottom: 22px; padding: 4px; background: #F0F2F8; border-radius: 10px; }
        .lp-tab { flex: 1; padding: 9px 12px; font-size: 12px; font-weight: 600; font-family: inherit; color: #8B8FA3; background: none; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .lp-tab.active { color: #fff; background: #4F6EF7; box-shadow: 0 2px 8px rgba(79,110,247,0.25); }

        /* Account Cards */
        .lp-accounts { display: flex; flex-direction: column; gap: 10px; }
        .lp-acc { width: 100%; padding: 14px 16px; background: #fff; border: 1.5px solid #E8EAF0; border-radius: 14px; cursor: pointer; font-family: inherit; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
        .lp-acc:hover:not(:disabled) { border-color: #4F6EF7; box-shadow: 0 6px 20px rgba(79,110,247,0.1); }
        .lp-acc:disabled { opacity: 0.5; cursor: wait; }
        .lp-acc-avatar { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0; }
        .lp-acc-role { font-size: 14px; font-weight: 700; color: #1A1D26; margin-bottom: 2px; }
        .lp-acc-detail { font-size: 11.5px; color: #8B8FA3; }
        .lp-acc-arrow { font-size: 18px; flex-shrink: 0; transition: transform 0.2s; margin-left: auto; }
        .lp-acc:hover .lp-acc-arrow { transform: translateX(4px); }

        /* Password Hint */
        .lp-pw-hint { text-align: center; font-size: 12px; color: #8B8FA3; margin-top: 16px; }
        .lp-pw-hint code { padding: 2px 8px; background: #EEF0F8; border-radius: 5px; color: #4F6EF7; font-family: 'JetBrains Mono', monospace; font-size: 11px; }

        /* Form Fields */
        .lp-field { margin-bottom: 16px; }
        .lp-field label { display: block; font-size: 13px; font-weight: 600; color: #5C6178; margin-bottom: 6px; }
        .lp-input-wrap { position: relative; }
        .lp-input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 14px; opacity: 0.4; }
        .lp-input-wrap input { width: 100%; padding: 12px 14px 12px 42px; font-size: 14px; font-family: inherit; color: #1A1D26; background: #fff; border: 1.5px solid #E2E5F1; border-radius: 10px; outline: none; transition: all 0.2s; }
        .lp-input-wrap input:focus { border-color: #4F6EF7; box-shadow: 0 0 0 3px rgba(79,110,247,0.1); }
        .lp-input-wrap input::placeholder { color: #C0C4D0; }

        .lp-row { display: flex; align-items: center; font-size: 13px; }
        .lp-check { display: flex; align-items: center; gap: 6px; color: #5C6178; cursor: pointer; font-size: 13px; }
        .lp-check input { accent-color: #4F6EF7; }
        .lp-link { color: #4F6EF7; text-decoration: none; font-weight: 600; font-size: 13px; }
        .lp-link:hover { text-decoration: underline; }

        .lp-submit { width: 100%; padding: 14px; font-size: 15px; font-weight: 700; font-family: inherit; color: #fff; background: linear-gradient(135deg, #4F6EF7, #5B78F9); border: none; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: 0 4px 16px rgba(79,110,247,0.25); }
        .lp-submit:hover:not(:disabled) { box-shadow: 0 8px 28px rgba(79,110,247,0.35); transform: translateY(-2px); }
        .lp-submit:disabled { opacity: 0.6; cursor: wait; }

        .lp-error { margin-top: 14px; padding: 12px; font-size: 13px; color: #E5484D; background: #FEF2F2; border-radius: 10px; border: 1px solid #FECDD3; text-align: center; }

        .lp-footer { text-align: center; margin-top: 28px; font-size: 11px; color: #B0B5C3; }

        .lp-spinner { display: inline-block; width: 18px; height: 18px; border: 2px solid rgba(79,110,247,0.2); border-top-color: #4F6EF7; border-radius: 50%; animation: sp 0.6s linear infinite; }
        @keyframes sp { to { transform: rotate(360deg); } }

        /* ═══ RESPONSIVE ═══ */
        @media (max-width: 900px) {
          .lp-page { flex-direction: column; }
          .lp-left { flex: none; padding: 40px 28px 36px; }
          .lp-hero-title { font-size: 32px; }
          .lp-right { width: 100%; padding: 32px 28px; }
        }
        @media (max-width: 480px) {
          .lp-left { padding: 28px 20px 24px; }
          .lp-hero-title { font-size: 28px; }
          .lp-right { padding: 24px 20px; }
        }
      `}</style>
    </div>
  );
}
