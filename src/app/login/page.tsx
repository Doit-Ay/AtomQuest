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
        .lp { display: flex; min-height: 100vh; background: #0A0D14; }

        /* ─── Left Panel ─── */
        .lp-left { flex: 1; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .lp-left-bg { position: absolute; inset: 0; }
        .lp-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(124,92,252,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,252,0.04) 1px, transparent 1px); background-size: 40px 40px; }
        .lp-glow { position: absolute; border-radius: 50%; filter: blur(100px); }
        .lp-glow-1 { width: 400px; height: 400px; background: #7C5CFC; opacity: 0.12; top: 10%; left: 10%; animation: float 8s ease-in-out infinite; }
        .lp-glow-2 { width: 350px; height: 350px; background: #00D4AA; opacity: 0.1; bottom: 10%; right: 10%; animation: float 8s ease-in-out infinite reverse; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-30px); } }

        .lp-brand { position: relative; z-index: 2; padding: 48px; max-width: 440px; }
        .lp-logo-wrap { margin-bottom: 20px; }
        .lp-brand-title { font-size: 36px; font-weight: 800; letter-spacing: -0.03em; background: linear-gradient(135deg, #7C5CFC, #00D4AA); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }
        .lp-brand-sub { font-size: 15px; color: #8B8FA3; line-height: 1.5; margin-bottom: 40px; }

        .lp-features { margin-bottom: 40px; }
        .lp-feature-card { display: flex; align-items: center; gap: 14px; padding: 18px 20px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; backdrop-filter: blur(12px); min-height: 72px; }
        .lp-feature-icon { font-size: 28px; flex-shrink: 0; }
        .lp-feature-title { font-size: 14px; font-weight: 600; color: #F0F2F5; margin-bottom: 2px; }
        .lp-feature-desc { font-size: 12px; color: #6B7080; }
        .lp-dots { display: flex; gap: 6px; margin-top: 14px; justify-content: center; }
        .lp-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.15); cursor: pointer; transition: all 0.3s; }
        .lp-dot-active { width: 20px; border-radius: 3px; background: #7C5CFC; }

        .lp-stats { display: flex; align-items: center; gap: 24px; padding: 18px 24px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; }
        .lp-stat { display: flex; flex-direction: column; align-items: center; flex: 1; }
        .lp-stat-num { font-size: 22px; font-weight: 700; color: #F0F2F5; font-family: 'JetBrains Mono', monospace; }
        .lp-stat-label { font-size: 11px; color: #5C6178; text-transform: uppercase; letter-spacing: 0.05em; }
        .lp-stat-sep { width: 1px; height: 28px; background: rgba(255,255,255,0.06); }

        /* ─── Right Panel ─── */
        .lp-right { width: 480px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; background: #0F1219; border-left: 1px solid rgba(255,255,255,0.04); }
        .lp-card { width: 100%; max-width: 380px; }
        .lp-card-title { font-size: 22px; font-weight: 700; color: #F0F2F5; margin-bottom: 4px; }
        .lp-card-sub { font-size: 13px; color: #6B7080; margin-bottom: 24px; }

        .lp-ms-btn { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 12px; font-size: 14px; font-weight: 500; font-family: inherit; color: #F0F2F5; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; cursor: pointer; transition: all 0.2s; }
        .lp-ms-btn:hover:not(:disabled) { background: rgba(255,255,255,0.07); border-color: rgba(0,164,239,0.3); box-shadow: 0 0 20px rgba(0,164,239,0.08); transform: translateY(-1px); }
        .lp-ms-btn:disabled { opacity: 0.5; cursor: wait; }

        .lp-divider { display: flex; align-items: center; gap: 14px; margin: 20px 0; font-size: 12px; color: #5C6178; }
        .lp-divider::before, .lp-divider::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.06); }

        .lp-toggle { display: flex; background: rgba(255,255,255,0.03); border-radius: 10px; padding: 3px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.06); }
        .lp-toggle-btn { flex: 1; padding: 8px; font-size: 12px; font-weight: 500; font-family: inherit; color: #6B7080; background: transparent; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .lp-toggle-btn.active { background: rgba(124,92,252,0.12); color: #F0F2F5; }

        .lp-roles { display: flex; flex-direction: column; gap: 8px; }
        .lp-role { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 12px 14px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; cursor: pointer; font-family: inherit; text-align: left; position: relative; overflow: hidden; transition: all 0.2s; }
        .lp-role:hover:not(:disabled) { background: rgba(255,255,255,0.04); border-color: var(--accent, #7C5CFC)40; transform: translateX(4px); box-shadow: 0 4px 16px rgba(0,0,0,0.2); }
        .lp-role:disabled { opacity: 0.5; cursor: wait; }
        .lp-role-left { display: flex; align-items: center; gap: 12px; }
        .lp-role-icon { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
        .lp-role-name { font-size: 13px; font-weight: 600; color: #F0F2F5; }
        .lp-role-email { font-size: 11px; color: #5C6178; font-family: 'JetBrains Mono', monospace; }
        .lp-role-arrow { color: #5C6178; font-size: 14px; transition: transform 0.2s; }
        .lp-role:hover .lp-role-arrow { transform: translateX(3px); color: var(--accent); }
        .lp-role-loader { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(10,13,20,0.8); backdrop-filter: blur(4px); }

        .lp-hint { font-size: 11px; color: #5C6178; text-align: center; margin-top: 14px; }
        .lp-hint code { font-family: 'JetBrains Mono', monospace; padding: 2px 6px; background: rgba(255,255,255,0.04); border-radius: 4px; color: #8B8FA3; }

        .lp-form { display: flex; flex-direction: column; gap: 14px; }
        .lp-field { display: flex; flex-direction: column; gap: 5px; }
        .lp-field label { font-size: 12px; font-weight: 500; color: #8B8FA3; }
        .lp-field input { padding: 10px 14px; font-size: 14px; font-family: inherit; color: #F0F2F5; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; outline: none; transition: all 0.2s; }
        .lp-field input:focus { border-color: #7C5CFC; box-shadow: 0 0 0 3px rgba(124,92,252,0.12); }
        .lp-field input::placeholder { color: #3A3F52; }

        .lp-submit { padding: 12px; font-size: 14px; font-weight: 600; font-family: inherit; color: #0A0D14; background: linear-gradient(135deg, #00D4AA, #7C5CFC); border: none; border-radius: 10px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
        .lp-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(124,92,252,0.25); }
        .lp-submit:disabled { opacity: 0.6; cursor: wait; }

        .lp-error { margin-top: 14px; padding: 10px 14px; font-size: 13px; color: #FF5C8A; background: rgba(255,92,138,0.08); border-radius: 10px; border: 1px solid rgba(255,92,138,0.15); text-align: center; }

        .lp-footer { margin-top: 32px; font-size: 11px; color: #3A3F52; }

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
