"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const DEMO_ACCOUNTS = [
  { role: "Employee", email: "employee@atmoquest.dev", name: "Aditya Singh", dept: "Engineering", icon: "👤", accent: "#00D4AA" },
  { role: "Manager", email: "manager@atmoquest.dev", name: "Rajesh Kumar", dept: "Engineering", icon: "👥", accent: "#7C5CFC" },
  { role: "Admin", email: "admin@atmoquest.dev", name: "Priya Sharma", dept: "Human Resources", icon: "⚙️", accent: "#FFB547" },
];

const FEATURES = [
  { icon: "🎯", title: "Smart Goal Tracking", desc: "OKR-aligned goal sheets with weighted scoring" },
  { icon: "📊", title: "Real-time Analytics", desc: "D3.js sunburst & interactive dashboards" },
  { icon: "🔗", title: "Microsoft SSO", desc: "Azure AD with org hierarchy sync" },
  { icon: "⚡", title: "Auto Escalations", desc: "Rule-based compliance monitoring" },
];

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"quick" | "manual">("quick");
  const [featureIdx, setFeatureIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setFeatureIdx((i) => (i + 1) % FEATURES.length), 3000);
    return () => clearInterval(t);
  }, []);

  const handleQuickLogin = async (accountEmail: string, role: string) => {
    setLoading(true); setSelectedRole(role); setError("");
    const result = await signIn("credentials", { email: accountEmail, password: "password123", redirect: false });
    if (result?.error) { setError("Login failed. Please try again."); setLoading(false); }
    else router.push("/dashboard");
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) { setError("Invalid email or password."); setLoading(false); }
    else router.push("/dashboard");
  };

  return (
    <div className="lp">
      {/* Left Panel — Branding */}
      <div className="lp-left">
        <div className="lp-left-bg">
          <div className="lp-grid" />
          <div className="lp-glow lp-glow-1" />
          <div className="lp-glow lp-glow-2" />
        </div>
        <motion.div className="lp-brand" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="lp-logo-wrap">
            <svg width="48" height="48" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="12" fill="url(#lg)" />
              <path d="M12 20L17 14L23 22L28 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="28" cy="16" r="2.5" fill="white" />
              <defs><linearGradient id="lg" x1="0" y1="0" x2="40" y2="40"><stop stopColor="#7C5CFC" /><stop offset="1" stopColor="#00D4AA" /></linearGradient></defs>
            </svg>
          </div>
          <h1 className="lp-brand-title">AtmoQuest</h1>
          <p className="lp-brand-sub">Enterprise Goal Setting &amp; Performance Tracking</p>

          <div className="lp-features">
            <AnimatePresence mode="wait">
              <motion.div key={featureIdx} className="lp-feature-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
                <span className="lp-feature-icon">{FEATURES[featureIdx].icon}</span>
                <div>
                  <div className="lp-feature-title">{FEATURES[featureIdx].title}</div>
                  <div className="lp-feature-desc">{FEATURES[featureIdx].desc}</div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="lp-dots">
              {FEATURES.map((_, i) => (<div key={i} className={`lp-dot ${i === featureIdx ? "lp-dot-active" : ""}`} onClick={() => setFeatureIdx(i)} />))}
            </div>
          </div>

          <div className="lp-stats">
            <div className="lp-stat"><span className="lp-stat-num">16</span><span className="lp-stat-label">Pages</span></div>
            <div className="lp-stat-sep" />
            <div className="lp-stat"><span className="lp-stat-num">3</span><span className="lp-stat-label">Roles</span></div>
            <div className="lp-stat-sep" />
            <div className="lp-stat"><span className="lp-stat-num">4</span><span className="lp-stat-label">Bonus</span></div>
          </div>
        </motion.div>
      </div>

      {/* Right Panel — Login */}
      <div className="lp-right">
        <motion.div className="lp-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <h2 className="lp-card-title">Welcome back</h2>
          <p className="lp-card-sub">Sign in to continue to your dashboard</p>

          {/* Microsoft SSO */}
          <button className="lp-ms-btn" onClick={() => signIn("microsoft-entra-id", { callbackUrl: "/dashboard" })} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 21 21"><rect x="1" y="1" width="9" height="9" fill="#F25022" /><rect x="11" y="1" width="9" height="9" fill="#7FBA00" /><rect x="1" y="11" width="9" height="9" fill="#00A4EF" /><rect x="11" y="11" width="9" height="9" fill="#FFB900" /></svg>
            Continue with Microsoft
          </button>

          <div className="lp-divider"><span>or</span></div>

          {/* Mode Toggle */}
          <div className="lp-toggle">
            <button className={`lp-toggle-btn ${mode === "quick" ? "active" : ""}`} onClick={() => setMode("quick")}>Demo Accounts</button>
            <button className={`lp-toggle-btn ${mode === "manual" ? "active" : ""}`} onClick={() => setMode("manual")}>Email & Password</button>
          </div>

          <AnimatePresence mode="wait">
            {mode === "quick" ? (
              <motion.div key="quick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <div className="lp-roles">
                  {DEMO_ACCOUNTS.map((a, i) => (
                    <motion.button key={a.role} className="lp-role" onClick={() => handleQuickLogin(a.email, a.role)} disabled={loading}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      style={{ "--accent": a.accent } as React.CSSProperties}>
                      <div className="lp-role-left">
                        <div className="lp-role-icon" style={{ background: `${a.accent}18`, color: a.accent }}>{a.icon}</div>
                        <div>
                          <div className="lp-role-name">{a.role}</div>
                          <div className="lp-role-email">{a.email}</div>
                        </div>
                      </div>
                      <div className="lp-role-arrow">→</div>
                      {loading && selectedRole === a.role && (<div className="lp-role-loader"><div className="lp-spin" /></div>)}
                    </motion.button>
                  ))}
                </div>
                <p className="lp-hint">🔑 All demo accounts use password: <code>password123</code></p>
              </motion.div>
            ) : (
              <motion.form key="manual" onSubmit={handleManualLogin} className="lp-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="lp-field">
                  <label>Email address</label>
                  <input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="lp-field">
                  <label>Password</label>
                  <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="lp-submit" disabled={loading}>
                  {loading ? <div className="lp-spin" /> : "Sign In"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {error && (<motion.div className="lp-error" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>{error}</motion.div>)}
        </motion.div>

        <div className="lp-footer">AtomQuest Hackathon 1.0 • Unstop</div>
      </div>

      <style jsx>{`
        .lp { display: flex; min-height: 100vh; background: #06080D; }

        /* ─── Left Panel ─── */
        .lp-left { flex: 1.2; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; background: linear-gradient(160deg, #0A0D14 0%, #0D1020 50%, #0A0D14 100%); }
        .lp-left-bg { position: absolute; inset: 0; }
        .lp-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(124,92,252,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,252,0.05) 1px, transparent 1px); background-size: 48px 48px; mask-image: radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 100%); }
        .lp-glow { position: absolute; border-radius: 50%; filter: blur(120px); }
        .lp-glow-1 { width: 500px; height: 500px; background: #7C5CFC; opacity: 0.15; top: 5%; left: 5%; animation: float 10s ease-in-out infinite; }
        .lp-glow-2 { width: 450px; height: 450px; background: #00D4AA; opacity: 0.12; bottom: 5%; right: 5%; animation: float 10s ease-in-out infinite reverse; }
        @keyframes float { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-25px) scale(1.05); } }

        .lp-brand { position: relative; z-index: 2; padding: 56px; max-width: 480px; }
        .lp-logo-wrap { margin-bottom: 24px; position: relative; }
        .lp-logo-wrap::after { content: ''; position: absolute; bottom: -12px; left: 0; width: 48px; height: 3px; background: linear-gradient(90deg, #7C5CFC, #00D4AA); border-radius: 2px; }
        .lp-brand-title { font-size: 42px; font-weight: 800; letter-spacing: -0.04em; background: linear-gradient(135deg, #9B7FFF 0%, #7C5CFC 30%, #00D4AA 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px; margin-top: 20px; }
        .lp-brand-sub { font-size: 16px; color: #6B7080; line-height: 1.6; margin-bottom: 48px; font-weight: 400; }

        .lp-features { margin-bottom: 48px; }
        .lp-feature-card { display: flex; align-items: center; gap: 16px; padding: 20px 22px; background: linear-gradient(135deg, rgba(124,92,252,0.06), rgba(0,212,170,0.03)); border: 1px solid rgba(124,92,252,0.12); border-radius: 16px; backdrop-filter: blur(16px); min-height: 80px; box-shadow: 0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04); }
        .lp-feature-icon { font-size: 32px; flex-shrink: 0; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3)); }
        .lp-feature-title { font-size: 15px; font-weight: 600; color: #F0F2F5; margin-bottom: 3px; }
        .lp-feature-desc { font-size: 13px; color: #6B7080; line-height: 1.4; }
        .lp-dots { display: flex; gap: 8px; margin-top: 16px; justify-content: center; }
        .lp-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.1); cursor: pointer; transition: all 0.3s; }
        .lp-dot-active { width: 24px; border-radius: 4px; background: linear-gradient(90deg, #7C5CFC, #00D4AA); box-shadow: 0 0 12px rgba(124,92,252,0.4); }

        .lp-stats { display: flex; align-items: center; gap: 0; padding: 22px 28px; background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.15); }
        .lp-stat { display: flex; flex-direction: column; align-items: center; flex: 1; }
        .lp-stat-num { font-size: 28px; font-weight: 800; font-family: 'JetBrains Mono', monospace; background: linear-gradient(135deg, #F0F2F5, #8B8FA3); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .lp-stat-label { font-size: 10px; color: #5C6178; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 2px; }
        .lp-stat-sep { width: 1px; height: 36px; background: linear-gradient(180deg, transparent, rgba(255,255,255,0.08), transparent); }

        /* ─── Right Panel ─── */
        .lp-right { width: 500px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px; background: linear-gradient(180deg, #0C0F17 0%, #0F1219 50%, #0C0F17 100%); border-left: 1px solid rgba(124,92,252,0.08); position: relative; }
        .lp-right::before { content: ''; position: absolute; top: 0; left: 0; width: 1px; height: 100%; background: linear-gradient(180deg, transparent 0%, rgba(124,92,252,0.15) 50%, transparent 100%); }
        .lp-card { width: 100%; max-width: 400px; }
        .lp-card-title { font-size: 24px; font-weight: 700; color: #F0F2F5; margin-bottom: 6px; letter-spacing: -0.02em; }
        .lp-card-sub { font-size: 14px; color: #5C6178; margin-bottom: 28px; }

        .lp-ms-btn { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 13px; font-size: 14px; font-weight: 600; font-family: inherit; color: #F0F2F5; background: linear-gradient(135deg, rgba(0,164,239,0.08), rgba(127,186,0,0.06)); border: 1px solid rgba(0,164,239,0.15); border-radius: 12px; cursor: pointer; transition: all 0.25s; }
        .lp-ms-btn:hover:not(:disabled) { background: linear-gradient(135deg, rgba(0,164,239,0.14), rgba(127,186,0,0.1)); border-color: rgba(0,164,239,0.35); box-shadow: 0 4px 24px rgba(0,164,239,0.12), 0 0 0 1px rgba(0,164,239,0.05); transform: translateY(-2px); }
        .lp-ms-btn:disabled { opacity: 0.5; cursor: wait; }

        .lp-divider { display: flex; align-items: center; gap: 14px; margin: 22px 0; font-size: 12px; color: #3A3F52; }
        .lp-divider::before, .lp-divider::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent); }

        .lp-toggle { display: flex; background: rgba(255,255,255,0.02); border-radius: 12px; padding: 4px; margin-bottom: 22px; border: 1px solid rgba(255,255,255,0.06); }
        .lp-toggle-btn { flex: 1; padding: 9px; font-size: 12px; font-weight: 600; font-family: inherit; color: #5C6178; background: transparent; border: none; border-radius: 9px; cursor: pointer; transition: all 0.25s; }
        .lp-toggle-btn.active { background: linear-gradient(135deg, rgba(124,92,252,0.15), rgba(124,92,252,0.08)); color: #C4B5FD; box-shadow: 0 2px 8px rgba(124,92,252,0.1); }

        .lp-roles { display: flex; flex-direction: column; gap: 10px; }
        .lp-role { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 14px 16px; background: linear-gradient(135deg, rgba(255,255,255,0.025), rgba(255,255,255,0.01)); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; cursor: pointer; font-family: inherit; text-align: left; position: relative; overflow: hidden; transition: all 0.25s; }
        .lp-role::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--accent, #7C5CFC); opacity: 0; transition: opacity 0.25s; border-radius: 0 2px 2px 0; }
        .lp-role:hover:not(:disabled) { background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)); border-color: var(--accent, #7C5CFC); transform: translateX(6px); box-shadow: 0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px var(--accent, #7C5CFC)20; }
        .lp-role:hover::before { opacity: 1; }
        .lp-role:disabled { opacity: 0.5; cursor: wait; }
        .lp-role-left { display: flex; align-items: center; gap: 14px; }
        .lp-role-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.06); }
        .lp-role-name { font-size: 14px; font-weight: 600; color: #F0F2F5; margin-bottom: 1px; }
        .lp-role-email { font-size: 11px; color: #5C6178; font-family: 'JetBrains Mono', monospace; }
        .lp-role-arrow { color: #3A3F52; font-size: 16px; transition: all 0.25s; font-weight: 300; }
        .lp-role:hover .lp-role-arrow { transform: translateX(4px); color: var(--accent); }
        .lp-role-loader { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(10,13,20,0.8); backdrop-filter: blur(4px); }

        .lp-hint { font-size: 11px; color: #5C6178; text-align: center; margin-top: 14px; }
        .lp-hint code { font-family: 'JetBrains Mono', monospace; padding: 2px 6px; background: rgba(255,255,255,0.04); border-radius: 4px; color: #8B8FA3; }

        .lp-form { display: flex; flex-direction: column; gap: 14px; }
        .lp-field { display: flex; flex-direction: column; gap: 5px; }
        .lp-field label { font-size: 12px; font-weight: 500; color: #8B8FA3; }
        .lp-field input { padding: 10px 14px; font-size: 14px; font-family: inherit; color: #F0F2F5; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; outline: none; transition: all 0.2s; }
        .lp-field input:focus { border-color: #7C5CFC; box-shadow: 0 0 0 3px rgba(124,92,252,0.12); }
        .lp-field input::placeholder { color: #3A3F52; }

        .lp-submit { padding: 13px; font-size: 14px; font-weight: 700; font-family: inherit; color: #0A0D14; background: linear-gradient(135deg, #00D4AA 0%, #7C5CFC 100%); border: none; border-radius: 12px; cursor: pointer; transition: all 0.25s; display: flex; align-items: center; justify-content: center; letter-spacing: 0.02em; position: relative; }
        .lp-submit::after { content: ''; position: absolute; inset: -1px; border-radius: 13px; background: linear-gradient(135deg, #00D4AA, #7C5CFC); z-index: -1; filter: blur(12px); opacity: 0; transition: opacity 0.25s; }
        .lp-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(124,92,252,0.3); }
        .lp-submit:hover::after { opacity: 0.4; }
        .lp-submit:disabled { opacity: 0.6; cursor: wait; }

        .lp-error { margin-top: 16px; padding: 12px 16px; font-size: 13px; color: #FF5C8A; background: rgba(255,92,138,0.06); border-radius: 12px; border: 1px solid rgba(255,92,138,0.12); text-align: center; }

        .lp-footer { margin-top: 36px; font-size: 11px; color: #2A2E3A; letter-spacing: 0.03em; }

        .lp-spin { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.15); border-top-color: #00D4AA; border-radius: 50%; animation: spin 0.6s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ─── Mobile ─── */
        @media (max-width: 860px) {
          .lp { flex-direction: column; }
          .lp-left { min-height: 40vh; padding: 32px; }
          .lp-brand { padding: 24px; max-width: 100%; }
          .lp-brand-title { font-size: 28px; }
          .lp-features { display: none; }
          .lp-right { width: 100%; border-left: none; border-top: 1px solid rgba(255,255,255,0.04); }
        }
      `}</style>
    </div>
  );
}
