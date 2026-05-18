"use client";

import { signIn } from "next-auth/react";
import { useState, CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const ACCOUNTS = [
  { role: "Employee", email: "employee@atmoquest.dev", name: "Aditya Singh", dept: "Engineering", color: "#00D4AA", initials: "AS" },
  { role: "Manager", email: "manager@atmoquest.dev", name: "Rajesh Kumar", dept: "Engineering", color: "#7C5CFC", initials: "RK" },
  { role: "Admin", email: "admin@atmoquest.dev", name: "Priya Sharma", dept: "Human Resources", color: "#FFB547", initials: "PS" },
];

// All styles as objects to avoid styled-jsx scoping issues with motion components
const S = {
  page: { display: "flex", minHeight: "100vh", fontFamily: "var(--font-sans, 'Inter', -apple-system, sans-serif)" } as CSSProperties,

  // Hero
  hero: { flex: "1.15", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", padding: 60 } as CSSProperties,
  heroBg: { position: "absolute", inset: 0 } as CSSProperties,
  heroGrad: { position: "absolute", inset: 0, background: "linear-gradient(135deg, #1a0533 0%, #0f0a2e 30%, #061528 60%, #030d1a 100%)" } as CSSProperties,
  heroGrid: { position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(124,92,252,0.06) 1px, transparent 1px)", backgroundSize: "32px 32px", maskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)" } as CSSProperties,
  heroContent: { position: "relative", zIndex: 2, maxWidth: 520 } as CSSProperties,
  heroBadge: { display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "rgba(124,92,252,0.12)", border: "1px solid rgba(124,92,252,0.2)", borderRadius: 100, fontSize: 13, fontWeight: 600, color: "#C4B5FD", marginBottom: 32 } as CSSProperties,
  heroTitle: { fontSize: 48, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.15, color: "#fff", marginBottom: 20, marginTop: 0 } as CSSProperties,
  heroTitleSpan: { background: "linear-gradient(135deg, #7C5CFC, #00D4AA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } as CSSProperties,
  heroDesc: { fontSize: 16, color: "#8B8FA3", lineHeight: 1.7, marginBottom: 36, maxWidth: 420 } as CSSProperties,
  heroFeatures: { display: "flex", flexDirection: "column", gap: 14, marginBottom: 44 } as CSSProperties,
  hf: { display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "#C4C7D4", fontWeight: 500 } as CSSProperties,
  hfDot: (c: string) => ({ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: c, boxShadow: `0 0 10px ${c}` }) as CSSProperties,
  heroStats: { display: "flex", gap: 32 } as CSSProperties,
  hsN: { fontSize: 24, fontWeight: 800, color: "#F0F2F5", fontFamily: "'JetBrains Mono', monospace" } as CSSProperties,
  hsL: { fontSize: 11, color: "#5C6178", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 } as CSSProperties,

  // Circles
  hc: (w: number, t: string, l: string, c: string): CSSProperties => ({ position: "absolute", width: w, height: w, borderRadius: "50%", border: `1px solid ${c}`, top: t, left: l === "auto" ? undefined : l, right: l === "auto" ? undefined : undefined, animation: "pulse 8s ease-in-out infinite" }),

  // Login Panel
  login: { width: 480, background: "#0B0E15", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "48px 44px", borderLeft: "1px solid rgba(255,255,255,0.04)" } as CSSProperties,
  loginInner: { width: "100%", maxWidth: 380 } as CSSProperties,
  loginLogo: { display: "flex", alignItems: "center", gap: 10, marginBottom: 28 } as CSSProperties,
  loginBrand: { fontSize: 18, fontWeight: 700, color: "#F0F2F5", letterSpacing: "-0.02em" } as CSSProperties,
  loginH2: { fontSize: 24, fontWeight: 700, color: "#F0F2F5", margin: "0 0 6px" } as CSSProperties,
  loginP: { fontSize: 14, color: "#5C6178", margin: "0 0 32px" } as CSSProperties,

  msBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: 13, fontSize: 14, fontWeight: 600, fontFamily: "inherit", color: "#F0F2F5", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, cursor: "pointer" } as CSSProperties,
  divider: { display: "flex", alignItems: "center", gap: 14, margin: "22px 0", fontSize: 12, color: "#3A3F52" } as CSSProperties,
  divLine: { flex: 1, height: 1, background: "rgba(255,255,255,0.06)" } as CSSProperties,
  tabs: { display: "flex", gap: 4, marginBottom: 20, padding: 4, background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)" } as CSSProperties,
  tabBtn: (active: boolean): CSSProperties => ({ flex: 1, padding: "9px 12px", fontSize: 12, fontWeight: 600, fontFamily: "inherit", color: active ? "#F0F2F5" : "#5C6178", background: active ? "rgba(124,92,252,0.12)" : "none", border: "none", borderRadius: 8, cursor: "pointer" }),

  card: { display: "flex", flexDirection: "row", alignItems: "center", gap: 14, width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, cursor: "pointer", fontFamily: "inherit", marginBottom: 10 } as CSSProperties,
  avatar: (c: string): CSSProperties => ({ width: 42, height: 42, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0, background: `${c}15`, color: c, border: `2px solid ${c}30` }),
  acRole: { fontSize: 14, fontWeight: 700, color: "#F0F2F5", marginBottom: 2 } as CSSProperties,
  acName: { fontSize: 11.5, color: "#5C6178", fontFamily: "'JetBrains Mono', monospace" } as CSSProperties,
  acArrow: (c: string): CSSProperties => ({ fontSize: 18, flexShrink: 0, color: c, marginLeft: "auto" }),
  pwHint: { textAlign: "center", fontSize: 12, color: "#3A3F52", marginTop: 14 } as CSSProperties,
  pwCode: { fontFamily: "'JetBrains Mono', monospace", padding: "2px 8px", background: "rgba(124,92,252,0.08)", borderRadius: 5, color: "#8B8FA3" } as CSSProperties,

  field: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 } as CSSProperties,
  fieldLabel: { fontSize: 12, fontWeight: 600, color: "#6B7080" } as CSSProperties,
  fieldInput: { padding: "11px 14px", fontSize: 14, fontFamily: "inherit", color: "#F0F2F5", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, outline: "none" } as CSSProperties,
  submitBtn: { padding: 13, fontSize: 15, fontWeight: 700, fontFamily: "inherit", color: "#fff", background: "linear-gradient(135deg, #7C5CFC, #00D4AA)", border: "none", borderRadius: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "100%" } as CSSProperties,
  errMsg: { marginTop: 14, padding: 12, fontSize: 13, color: "#FF5C8A", background: "rgba(255,92,138,0.06)", borderRadius: 10, border: "1px solid rgba(255,92,138,0.1)", textAlign: "center" } as CSSProperties,
  loginFoot: { marginTop: 40, fontSize: 11, color: "#2A2E3A" } as CSSProperties,
};

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
    <div style={S.page} className="lp-page">
      {/* ═══ LEFT HERO ═══ */}
      <div style={S.hero} className="lp-hero">
        <div style={S.heroBg}>
          <div style={S.heroGrad} />
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", border: "1px solid rgba(124,92,252,0.08)", top: -150, right: -150 }} />
            <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(0,212,170,0.08)", bottom: -100, left: -100 }} />
            <div style={{ position: "absolute", width: 250, height: 250, borderRadius: "50%", border: "1px solid rgba(255,181,71,0.06)", top: "40%", right: "10%" }} />
          </div>
          <div style={S.heroGrid} />
        </div>

        <motion.div style={S.heroContent} className="lp-hero-content" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
          <div style={S.heroBadge} className="lp-badge">🚀 AtomQuest Hackathon 1.0</div>

          <h1 style={S.heroTitle} className="lp-title">
            Track Goals.<br />
            <span style={S.heroTitleSpan}>Drive Results.</span>
          </h1>

          <p style={S.heroDesc}>
            Enterprise performance management with OKR tracking, automated approvals, and real-time analytics.
          </p>

          <div style={S.heroFeatures} className="lp-features">
            {[
              { c: "#00D4AA", t: "Microsoft SSO & Org Sync" },
              { c: "#7C5CFC", t: "Teams Notifications" },
              { c: "#FFB547", t: "D3.js Analytics Dashboard" },
              { c: "#FF5C8A", t: "Rule-Based Escalations" },
            ].map(f => (
              <div key={f.t} style={S.hf}>
                <div style={S.hfDot(f.c)} />
                {f.t}
              </div>
            ))}
          </div>

          <div style={S.heroStats} className="lp-stats">
            {[
              { n: "16", l: "Pages" },
              { n: "3", l: "Roles" },
              { n: "4/4", l: "Bonus" },
              { n: "100%", l: "TypeScript" },
            ].map(s => (
              <div key={s.l} style={{ display: "flex", flexDirection: "column" }}>
                <span style={S.hsN}>{s.n}</span>
                <span style={S.hsL}>{s.l}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ═══ RIGHT LOGIN ═══ */}
      <div style={S.login} className="lp-login">
        <motion.div style={S.loginInner} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <div style={S.loginLogo}>
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="11" fill="url(#lg2)" />
              <path d="M12 22L17 15L23 23L28 17" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="28" cy="17" r="2" fill="#fff" />
              <defs><linearGradient id="lg2" x1="0" y1="0" x2="40" y2="40"><stop stopColor="#7C5CFC" /><stop offset="1" stopColor="#00D4AA" /></linearGradient></defs>
            </svg>
            <span style={S.loginBrand}>AtmoQuest</span>
          </div>
          <h2 style={S.loginH2}>Sign in</h2>
          <p style={S.loginP}>Choose a method to access your dashboard</p>

          <motion.button style={S.msBtn} onClick={() => signIn("microsoft-entra-id", { callbackUrl: "/dashboard" })} disabled={loading} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
            <svg width="20" height="20" viewBox="0 0 21 21"><rect x="1" y="1" width="9" height="9" fill="#F25022"/><rect x="11" y="1" width="9" height="9" fill="#7FBA00"/><rect x="1" y="11" width="9" height="9" fill="#00A4EF"/><rect x="11" y="11" width="9" height="9" fill="#FFB900"/></svg>
            Continue with Microsoft
          </motion.button>

          <div style={S.divider}><div style={S.divLine} /><span>or</span><div style={S.divLine} /></div>

          <div style={S.tabs}>
            <button style={S.tabBtn(tab === "demo")} onClick={() => setTab("demo")}>Demo Accounts</button>
            <button style={S.tabBtn(tab === "email")} onClick={() => setTab("email")}>Email & Password</button>
          </div>

          <AnimatePresence mode="wait">
            {tab === "demo" ? (
              <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {ACCOUNTS.map((a, i) => (
                  <motion.button key={a.role} style={S.card} onClick={() => quickLogin(a)} disabled={loading}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                    <div style={S.avatar(a.color)}>{a.initials}</div>
                    <div style={{ flex: 1, textAlign: "left" as const }}>
                      <div style={S.acRole}>{a.role}</div>
                      <div style={S.acName}>{a.name} · {a.dept}</div>
                    </div>
                    <div style={S.acArrow(a.color)}>
                      {loading && activeRole === a.role ? <span style={{ display: "inline-block", width: 18, height: 18, border: "2px solid rgba(255,255,255,0.15)", borderTopColor: "#00D4AA", borderRadius: "50%", animation: "sp 0.6s linear infinite" }} /> : "→"}
                    </div>
                  </motion.button>
                ))}
                <p style={S.pwHint}>🔑 Password: <code style={S.pwCode}>password123</code></p>
              </motion.div>
            ) : (
              <motion.form key="e" onSubmit={manualLogin} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={S.field}>
                  <label style={S.fieldLabel}>Email address</label>
                  <input style={S.fieldInput} type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div style={S.field}>
                  <label style={S.fieldLabel}>Password</label>
                  <input style={S.fieldInput} type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <motion.button type="submit" style={S.submitBtn} disabled={loading} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  {loading ? "..." : "Sign In →"}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {error && <motion.p style={S.errMsg as CSSProperties} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.p>}
        </motion.div>
        <div style={S.loginFoot}>Built with Next.js 16 · Prisma · Azure AD</div>
      </div>

      <style>{`
        @keyframes sp { to { transform: rotate(360deg); } }

        @media (max-width: 900px) {
          .lp-page { flex-direction: column !important; }
          .lp-hero { flex: none !important; min-height: auto !important; padding: 40px 28px 36px !important; }
          .lp-hero-content { max-width: 100% !important; }
          .lp-badge { font-size: 12px !important; margin-bottom: 20px !important; }
          .lp-title { font-size: 32px !important; margin-bottom: 14px !important; }
          .lp-features { margin-bottom: 28px !important; gap: 10px !important; }
          .lp-stats { gap: 20px !important; flex-wrap: wrap !important; }
          .lp-login { width: 100% !important; padding: 32px 28px !important; border-left: none !important; border-top: 1px solid rgba(255,255,255,0.04) !important; }
        }

        @media (max-width: 480px) {
          .lp-hero { padding: 28px 20px 24px !important; }
          .lp-title { font-size: 26px !important; }
          .lp-stats { gap: 16px !important; }
          .lp-login { padding: 24px 20px !important; }
        }
      `}</style>
    </div>
  );
}
