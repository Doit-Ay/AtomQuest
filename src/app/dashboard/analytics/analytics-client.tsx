"use client";

import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { SunburstChart } from "@/components/charts/sunburst-chart";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface AnalyticsClientProps {
  qoqTrend: any[];
  thrustAreaData: any[];
  employeePerf: any[];
  statusData: any[];
  sunburstData: any;
  cycleName: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-md)",
        padding: "10px 14px",
        fontSize: 12,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4, color: "var(--text-primary)" }}>
        {label}
      </div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color, display: "flex", gap: 8 }}>
          <span>{p.name}:</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
            {p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export function AnalyticsClient({
  qoqTrend,
  thrustAreaData,
  employeePerf,
  statusData,
  sunburstData,
  cycleName,
}: AnalyticsClientProps) {
  const totalGoals = statusData.reduce((s, d) => s + d.value, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">
            {cycleName} • Performance insights & organizational alignment
          </p>
        </div>
      </div>

      {/* Row 1: QoQ Trend + Status Distribution */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {/* QoQ Trend */}
        <motion.div
          className="glass-card"
          style={{ padding: 20 }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
            Quarter-over-Quarter Performance
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={qoqTrend}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00D4AA" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
              <XAxis
                dataKey="quarter"
                stroke="var(--text-tertiary)"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="var(--text-tertiary)"
                fontSize={12}
                tickLine={false}
                domain={[0, 150]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="avgScore"
                name="Avg Score"
                stroke="#00D4AA"
                strokeWidth={2.5}
                fill="url(#scoreGrad)"
                dot={{ fill: "#00D4AA", r: 4, strokeWidth: 2, stroke: "#0A0D14" }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Goal Status */}
        <motion.div
          className="glass-card"
          style={{ padding: 20 }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
            Goal Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 16,
              marginTop: 8,
            }}
          >
            {statusData.map((d) => (
              <div
                key={d.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: d.color,
                    display: "inline-block",
                  }}
                />
                <span style={{ color: "var(--text-secondary)" }}>
                  {d.name} ({totalGoals > 0 ? Math.round((d.value / totalGoals) * 100) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 2: Thrust Area + Employee Performance */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {/* Thrust Area Distribution */}
        <motion.div
          className="glass-card"
          style={{ padding: 20 }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
            Goals by Thrust Area
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={thrustAreaData} layout="vertical" barSize={14}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis
                type="number"
                stroke="var(--text-tertiary)"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="var(--text-tertiary)"
                fontSize={11}
                tickLine={false}
                width={120}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                name="Goals"
                fill="#7C5CFC"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Employee Performance Comparison */}
        <motion.div
          className="glass-card"
          style={{ padding: 20 }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
            Employee Performance
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={employeePerf} barSize={24}>
              <defs>
                <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D4AA" />
                  <stop offset="100%" stopColor="#7C5CFC" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                stroke="var(--text-tertiary)"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="var(--text-tertiary)"
                fontSize={11}
                tickLine={false}
                domain={[0, 150]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "var(--text-secondary)" }}
              />
              <Bar
                dataKey="score"
                name="Weighted Score"
                fill="url(#perfGrad)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Row 3: Sunburst — Organizational Alignment */}
      <motion.div
        className="glass-card"
        style={{ padding: 20 }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
          Organizational Goal Alignment
        </h3>
        <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 16 }}>
          Radial hierarchy: Organization → Department → Employee → Goals (hover for details)
        </p>
        <SunburstChart data={sunburstData} />
      </motion.div>
    </div>
  );
}
