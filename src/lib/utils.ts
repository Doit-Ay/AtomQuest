import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function computeScore(
  uom: string,
  target: number,
  actual: number
): number {
  switch (uom) {
    case "NUMERIC_MIN":
    case "PERCENTAGE_MIN":
      // Higher is better
      return target > 0 ? Math.min((actual / target) * 100, 100) : 0;
    case "NUMERIC_MAX":
    case "PERCENTAGE_MAX":
      // Lower is better
      return actual > 0 ? Math.min((target / actual) * 100, 100) : 100;
    case "ZERO":
      // Zero = success
      return actual === 0 ? 100 : 0;
    case "TIMELINE":
      // Will be handled via date comparison
      return actual <= target ? 100 : 0;
    default:
      return 0;
  }
}

export const UOM_LABELS: Record<string, string> = {
  NUMERIC_MIN: "Numeric (Higher is Better)",
  NUMERIC_MAX: "Numeric (Lower is Better)",
  PERCENTAGE_MIN: "% (Higher is Better)",
  PERCENTAGE_MAX: "% (Lower is Better)",
  TIMELINE: "Timeline",
  ZERO: "Zero-Based",
};

export const STATUS_CONFIG = {
  NOT_STARTED: { label: "Not Started", color: "rose", icon: "⏸" },
  ON_TRACK: { label: "On Track", color: "teal", icon: "▶" },
  COMPLETED: { label: "Completed", color: "violet", icon: "✓" },
} as const;

export const GOAL_SHEET_STATUS = {
  DRAFT: { label: "Draft", color: "gray" },
  SUBMITTED: { label: "Submitted", color: "amber" },
  APPROVED: { label: "Approved", color: "teal" },
  RETURNED: { label: "Returned", color: "rose" },
} as const;

export const QUARTERS = ["Q1", "Q2", "Q3", "Q4"] as const;

export const THRUST_AREAS = [
  "Revenue Growth",
  "Customer Satisfaction",
  "Operational Excellence",
  "Innovation & Technology",
  "People & Culture",
  "Cost Optimization",
  "Quality & Compliance",
  "Market Expansion",
];
