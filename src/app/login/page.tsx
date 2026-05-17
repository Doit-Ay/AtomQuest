"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const ACCOUNTS = [
  { role: "Employee", email: "employee@atmoquest.dev", name: "Aditya Singh", dept: "Engineering", color: "#00D4AA" },
  { role: "Manager", email: "manager@atmoquest.dev", name: "Rajesh Kumar", dept: "Engineering", color: "#7C5CFC" },
  { role: "Admin", email: "admin@atmoquest.dev", name: "Priya Sharma", dept: "Human Resources", color: "#FFB547" },
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
    <div className="pg">
      {/* Animated background */}
      <div className="bg">
        <div className="mesh" />
        <div className="orb o1" /><div className="orb o2" /><div className="orb o3" /><div className="orb o4" />
        <div className="rays" />
      </div>

      <motion.div className="card" initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
        {/* Header */}
        <div className="hdr">
          <motion.div className="logo" initial={{ rotate: -10 }} animate={{ rotate: 0 }} transition={{ type: "spring", stiffness: 200 }}>
            <svg width="44" height="44" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="11" fill="url(#g1)" />
              <path d="M12 22L17 15L23 23L28 17" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="28" cy="17" r="2" fill="#fff" />
              <defs><linearGradient id="g1" x1="0" y1="0" x2="40" y2="40"><stop stopColor="#7C5CFC" /><stop offset="1" stopColor="#00D4AA" /></linearGradient></defs>
            </svg>
          </motion.div>
          <h1>AtmoQuest</h1>
          <p className="tagline">Goal Setting & Performance Tracking</p>
        </div>

        {/* Microsoft SSO */}
        <button className="ms" onClick={() => signIn("microsoft-entra-id", { callbackUrl: "/dashboard" })} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 21 21"><rect x="1" y="1" width="9" height="9" fill="#F25022"/><rect x="11" y="1" width="9" height="9" fill="#7FBA00"/><rect x="1" y="11" width="9" height="9" fill="#00A4EF"/><rect x="11" y="11" width="9" height="9" fill="#FFB900"/></svg>
          Continue with Microsoft
        </button>

        <div className="sep"><span>or continue with</span></div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${tab === "demo" ? "on" : ""}`} onClick={() => setTab("demo")}>
            <span className="tab-icon">⚡</span> Quick Access
          </button>
          <button className={`tab ${tab === "email" ? "on" : ""}`} onClick={() => setTab("email")}>
            <span className="tab-icon">✉️</span> Email
          </button>
          <div className="tab-ink" style={{ transform: `translateX(${tab === "demo" ? "0" : "100"}%)` }} />
        </div>

        <AnimatePresence mode="wait">
          {tab === "demo" ? (
            <motion.div key="d" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <div className="roles">
                {ACCOUNTS.map((a, i) => (
                  <motion.button key={a.role} className="role" onClick={() => quickLogin(a)} disabled={loading}
                    whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                    style={{ "--c": a.color } as React.CSSProperties}>
                    <div className="role-pip" />
                    <div className="role-info">
                      <span className="role-name">{a.role}</span>
                      <span className="role-detail">{a.name} · {a.dept}</span>
                    </div>
                    <span className="role-go">{loading && activeRole === a.role ? <span className="spin" /> : "→"}</span>
                  </motion.button>
                ))}
              </div>
              <p className="pw">Password for all: <code>password123</code></p>
            </motion.div>
          ) : (
            <motion.form key="e" onSubmit={manualLogin} className="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="fld">
                <label>Email</label>
                <input type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="fld">
                <label>Password</label>
                <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <motion.button type="submit" className="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                {loading ? <span className="spin" /> : "Sign In"}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        {error && <motion.p className="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.p>}

        <div className="foot">
          <span>AtomQuest Hackathon 1.0</span>
          <span className="dot" />
          <span>Unstop</span>
        </div>
      </motion.div>

      <style jsx>{`
        .pg{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#050709;position:relative;overflow:hidden;font-family:var(--font-sans,'Inter',-apple-system,sans-serif)}

        /* === BACKGROUND === */
        .bg{position:absolute;inset:0;z-index:0}
        .mesh{position:absolute;inset:0;background:
          radial-gradient(ellipse 80% 50% at 50% -20%,rgba(124,92,252,0.15),transparent),
          radial-gradient(ellipse 60% 40% at 80% 100%,rgba(0,212,170,0.1),transparent),
          radial-gradient(ellipse 50% 50% at 10% 60%,rgba(255,181,71,0.06),transparent)}
        .orb{position:absolute;border-radius:50%;filter:blur(100px);will-change:transform}
        .o1{width:420px;height:420px;background:rgba(124,92,252,0.25);top:-10%;right:10%;animation:mv1 12s ease-in-out infinite}
        .o2{width:380px;height:380px;background:rgba(0,212,170,0.22);bottom:-5%;left:5%;animation:mv2 14s ease-in-out infinite}
        .o3{width:260px;height:260px;background:rgba(255,92,138,0.15);top:35%;left:55%;animation:mv1 10s ease-in-out infinite reverse}
        .o4{width:200px;height:200px;background:rgba(255,181,71,0.12);top:15%;left:3%;animation:mv2 16s ease-in-out infinite}
        .rays{position:absolute;inset:0;background:repeating-conic-gradient(rgba(124,92,252,0.03) 0deg,transparent 1.5deg,transparent 4deg);animation:rayrot 120s linear infinite}
        @keyframes mv1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,-40px) scale(1.15)}}
        @keyframes mv2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-25px,35px) scale(1.12)}}
        @keyframes rayrot{to{transform:rotate(360deg)}}

        /* === CARD === */
        .card{position:relative;z-index:2;width:100%;max-width:440px;padding:44px 40px 36px;
          background:rgba(10,13,20,0.88);
          backdrop-filter:blur(60px) saturate(1.6);
          -webkit-backdrop-filter:blur(60px) saturate(1.6);
          border:1px solid rgba(124,92,252,0.12);
          border-radius:28px;
          box-shadow:0 32px 100px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.05) inset,0 1px 0 rgba(255,255,255,0.08) inset,0 0 60px rgba(124,92,252,0.04)}

        /* === HEADER === */
        .hdr{text-align:center;margin-bottom:32px}
        .logo{display:inline-block;margin-bottom:16px;filter:drop-shadow(0 4px 20px rgba(124,92,252,0.3))}
        .hdr h1{font-size:30px;font-weight:800;letter-spacing:-0.04em;
          background:linear-gradient(135deg,#fff 0%,#C4B5FD 50%,#00D4AA 100%);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin:0 0 6px}
        .tagline{font-size:13px;color:#6B7080;letter-spacing:0.01em}

        /* === MICROSOFT === */
        .ms{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:13px;
          font-size:14px;font-weight:600;font-family:inherit;color:#F0F2F5;cursor:pointer;
          background:linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02));
          border:1px solid rgba(255,255,255,0.1);border-radius:14px;transition:all .25s}
        .ms:hover:not(:disabled){background:linear-gradient(135deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04));
          border-color:rgba(0,164,239,0.4);box-shadow:0 0 32px rgba(0,164,239,0.12);transform:translateY(-2px)}
        .ms:disabled{opacity:.5;cursor:wait}

        /* === SEPARATOR === */
        .sep{display:flex;align-items:center;gap:16px;margin:24px 0;font-size:11px;color:#3A3F52;text-transform:uppercase;letter-spacing:.08em}
        .sep::before,.sep::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)}

        /* === TABS === */
        .tabs{display:flex;position:relative;background:rgba(255,255,255,0.03);border-radius:14px;padding:4px;margin-bottom:24px;border:1px solid rgba(255,255,255,0.05)}
        .tab{flex:1;padding:10px;font-size:13px;font-weight:600;font-family:inherit;color:#5C6178;background:none;border:none;cursor:pointer;transition:color .25s;z-index:2;display:flex;align-items:center;justify-content:center;gap:6px;border-radius:11px}
        .tab.on{color:#F0F2F5}
        .tab-icon{font-size:14px}
        .tab-ink{position:absolute;top:4px;left:4px;width:calc(50% - 4px);height:calc(100% - 8px);
          background:linear-gradient(135deg,rgba(124,92,252,0.18),rgba(0,212,170,0.08));
          border-radius:11px;transition:transform .3s cubic-bezier(.4,0,.2,1);z-index:1;
          box-shadow:0 2px 12px rgba(124,92,252,0.15)}

        /* === ROLE CARDS === */
        .roles{display:flex;flex-direction:column;gap:10px}
        .role{display:flex;flex-direction:row;align-items:center;gap:14px;width:100%;padding:16px 18px;
          background:rgba(255,255,255,0.03);
          border:1px solid rgba(255,255,255,0.07);border-radius:16px;
          cursor:pointer;font-family:inherit;text-align:left;position:relative;overflow:hidden;transition:all .25s}
        .role:hover:not(:disabled){border-color:var(--c);background:rgba(255,255,255,0.05);
          box-shadow:0 0 0 1px var(--c),0 8px 32px rgba(0,0,0,0.4),0 0 24px color-mix(in srgb,var(--c) 8%,transparent)}
        .role:disabled{opacity:.5;cursor:wait}
        .role-pip{width:4px;align-self:stretch;min-height:36px;border-radius:4px;background:var(--c);opacity:.6;transition:all .25s;flex-shrink:0}
        .role:hover .role-pip{opacity:1;box-shadow:0 0 12px var(--c);width:5px}
        .role-info{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
        .role-name{font-size:15px;font-weight:700;color:#F0F2F5;line-height:1.2}
        .role-detail{font-size:11.5px;color:#6B7080;font-family:'JetBrains Mono',monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .role-go{font-size:20px;color:#3A3F52;transition:all .25s;flex-shrink:0;margin-left:auto}
        .role:hover .role-go{color:var(--c);transform:translateX(5px)}

        /* === FORM === */
        .form{display:flex;flex-direction:column;gap:16px}
        .fld{display:flex;flex-direction:column;gap:6px}
        .fld label{font-size:12px;font-weight:600;color:#6B7080;text-transform:uppercase;letter-spacing:.04em}
        .fld input{padding:12px 16px;font-size:14px;font-family:inherit;color:#F0F2F5;
          background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);
          border-radius:12px;outline:none;transition:all .25s}
        .fld input:focus{border-color:#7C5CFC;box-shadow:0 0 0 3px rgba(124,92,252,0.15),0 0 20px rgba(124,92,252,0.08)}
        .fld input::placeholder{color:#2A2E3A}
        .submit{padding:14px;font-size:15px;font-weight:700;font-family:inherit;color:#0A0D14;
          background:linear-gradient(135deg,#00D4AA,#7C5CFC);border:none;border-radius:14px;
          cursor:pointer;display:flex;align-items:center;justify-content:center;position:relative;letter-spacing:.02em}
        .submit:hover:not(:disabled){box-shadow:0 12px 40px rgba(124,92,252,0.35),0 0 60px rgba(0,212,170,0.15)}
        .submit:disabled{opacity:.6;cursor:wait}

        /* === MISC === */
        .pw{text-align:center;font-size:11px;color:#3A3F52;margin-top:16px}
        .pw code{font-family:'JetBrains Mono',monospace;padding:3px 8px;background:rgba(124,92,252,0.08);border-radius:6px;color:#8B8FA3;font-size:11px}
        .err{margin-top:16px;padding:12px;font-size:13px;color:#FF5C8A;background:rgba(255,92,138,0.06);border-radius:12px;border:1px solid rgba(255,92,138,0.1);text-align:center}
        .foot{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:28px;font-size:11px;color:#2A2E3A}
        .dot{width:3px;height:3px;border-radius:50%;background:#3A3F52}
        .spin{display:inline-block;width:18px;height:18px;border:2px solid rgba(255,255,255,0.15);border-top-color:#00D4AA;border-radius:50%;animation:sp .6s linear infinite}
        @keyframes sp{to{transform:rotate(360deg)}}

        @media(max-width:520px){
          .card{margin:16px;padding:32px 24px 28px;border-radius:20px}
          .hdr h1{font-size:26px}
        }
      `}</style>
    </div>
  );
}
