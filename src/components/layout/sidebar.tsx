"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

interface SidebarProps {
  role: string;
  name: string;
  email: string;
}

const NAV_ITEMS = {
  EMPLOYEE: [
    { href: "/dashboard", label: "Dashboard", icon: "◆" },
    { href: "/dashboard/goals", label: "My Goals", icon: "◎" },
    { href: "/dashboard/checkins", label: "Check-ins", icon: "◈" },
    { href: "/dashboard/analytics", label: "Analytics", icon: "◧" },
  ],
  MANAGER: [
    { href: "/dashboard", label: "Dashboard", icon: "◆" },
    { href: "/dashboard/goals", label: "My Goals", icon: "◎" },
    { href: "/dashboard/approvals", label: "Approvals", icon: "✓" },
    { href: "/dashboard/team", label: "Team", icon: "⊞" },
    { href: "/dashboard/checkins", label: "Check-ins", icon: "◈" },
    { href: "/dashboard/shared-goals", label: "Shared Goals", icon: "⊕" },
    { href: "/dashboard/escalations", label: "Escalations", icon: "⚡" },
    { href: "/dashboard/analytics", label: "Analytics", icon: "◧" },
    { href: "/dashboard/reports", label: "Reports", icon: "⊡" },
  ],
  ADMIN: [
    { href: "/dashboard", label: "Dashboard", icon: "◆" },
    { href: "/dashboard/goals", label: "Goals", icon: "◎" },
    { href: "/dashboard/approvals", label: "Approvals", icon: "✓" },
    { href: "/dashboard/team", label: "Team", icon: "⊞" },
    { href: "/dashboard/shared-goals", label: "Shared Goals", icon: "⊕" },
    { href: "/dashboard/escalations", label: "Escalations", icon: "⚡" },
    { href: "/dashboard/analytics", label: "Analytics", icon: "◧" },
    { href: "/dashboard/admin", label: "Admin", icon: "⚙" },
    { href: "/dashboard/reports", label: "Reports", icon: "⊡" },
    { href: "/dashboard/audit", label: "Audit Log", icon: "☰" },
  ],
};

export function Sidebar({ role, name, email }: SidebarProps) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role as keyof typeof NAV_ITEMS] || NAV_ITEMS.EMPLOYEE;

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "4px 8px",
          marginBottom: 24,
        }}
      >
        <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="url(#sb-grad)" />
          <path
            d="M12 20L17 14L23 22L28 16"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="28" cy="16" r="2.5" fill="white" />
          <defs>
            <linearGradient id="sb-grad" x1="0" y1="0" x2="40" y2="40">
              <stop stopColor="#7C5CFC" />
              <stop offset="1" stopColor="#00D4AA" />
            </linearGradient>
          </defs>
        </svg>
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "-0.03em",
          }}
        >
          AtomQuest
        </span>
      </div>

      {/* Navigation */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {items.map((item, i) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={item.href}
                className={`sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
              >
                <span style={{ fontSize: 14, width: 20, textAlign: "center" }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px",
          background: "var(--bg-primary)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div className="avatar">{initials}</div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--text-tertiary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {email}
          </div>
        </div>
        <span
          className={`badge badge-${
            role === "ADMIN" ? "amber" : role === "MANAGER" ? "violet" : "teal"
          }`}
          style={{ fontSize: 9 }}
        >
          {role}
        </span>
      </div>
    </aside>
  );
}
