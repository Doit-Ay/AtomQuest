"use client";

import { signOut } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface TopbarProps {
  name: string;
  role: string;
}

const COMMAND_ITEMS = [
  { label: "Go to Dashboard", href: "/dashboard", icon: "◆" },
  { label: "Go to My Goals", href: "/dashboard/goals", icon: "◎" },
  { label: "Create New Goal", href: "/dashboard/goals/new", icon: "+" },
  { label: "View Check-ins", href: "/dashboard/checkins", icon: "◈" },
  { label: "View Team", href: "/dashboard/team", icon: "⊞" },
  { label: "View Reports", href: "/dashboard/reports", icon: "⊡" },
  { label: "Sign Out", href: "__signout__", icon: "↪" },
];

export function Topbar({ name, role }: TopbarProps) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const router = useRouter();

  const filtered = COMMAND_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = useCallback(
    (item: (typeof COMMAND_ITEMS)[number]) => {
      setCommandOpen(false);
      setSearch("");
      if (item.href === "__signout__") {
        signOut({ callbackUrl: "/login" });
      } else {
        router.push(item.href);
      }
    },
    [router]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen((v) => !v);
        setSearch("");
        setSelectedIdx(0);
      }
      if (e.key === "Escape") {
        setCommandOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!commandOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filtered[selectedIdx]) {
        handleSelect(filtered[selectedIdx]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandOpen, filtered, selectedIdx, handleSelect]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <>
      <header className="topbar">
        <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>
          {greeting()},{" "}
          <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
            {name.split(" ")[0]}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Command Palette Trigger */}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setCommandOpen(true);
              setSearch("");
            }}
            style={{ gap: 6 }}
          >
            <span style={{ fontSize: 12 }}>Search</span>
            <kbd>Ctrl+K</kbd>
          </button>

          {/* Sign Out */}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Command Palette */}
      <AnimatePresence>
        {commandOpen && (
          <motion.div
            className="command-palette-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setCommandOpen(false)}
          >
            <motion.div
              className="command-palette"
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                className="command-palette-input"
                placeholder="Type a command or search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedIdx(0);
                }}
                autoFocus
              />
              <div className="command-palette-list">
                {filtered.map((item, idx) => (
                  <div
                    key={item.label}
                    className={`command-palette-item ${
                      idx === selectedIdx ? "command-palette-item-active" : ""
                    }`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIdx(idx)}
                  >
                    <span style={{ fontSize: 14, width: 20, textAlign: "center" }}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      color: "var(--text-tertiary)",
                      fontSize: 13,
                    }}
                  >
                    No results found
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
