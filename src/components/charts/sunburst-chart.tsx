"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface SunburstChartProps {
  data: any;
}

const STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: "#FF5C8A",
  ON_TRACK: "#7C5CFC",
  COMPLETED: "#00D4AA",
};

const DEPTH_COLORS = ["#1C2030", "#2A2F42", "#7C5CFC", "#00D4AA"];

export function SunburstChart({ data }: SunburstChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    content: any;
  }>({ show: false, x: 0, y: 0, content: null });

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const width = 520;
    const height = 520;
    const radius = width / 2;

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const root = d3
      .hierarchy(data)
      .sum((d: any) => d.value || 1)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const partition = d3.partition<any>().size([2 * Math.PI, radius]);

    partition(root);

    const arc = d3
      .arc<d3.HierarchyRectangularNode<any>>()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .padAngle(0.008)
      .padRadius(radius / 3)
      .innerRadius((d) => Math.max(0, d.y0 * 0.85))
      .outerRadius((d) => Math.max(0, d.y1 * 0.85 - 2))
      .cornerRadius(3);

    svg
      .selectAll("path")
      .data(root.descendants().filter((d) => d.depth > 0))
      .enter()
      .append("path")
      .attr("d", arc as any)
      .attr("fill", (d) => {
        if (d.data.status) {
          return STATUS_COLORS[d.data.status] || DEPTH_COLORS[d.depth];
        }
        return DEPTH_COLORS[Math.min(d.depth, DEPTH_COLORS.length - 1)];
      })
      .attr("fill-opacity", (d) => {
        if (d.data.score !== undefined) {
          return 0.4 + (d.data.score / 100) * 0.6;
        }
        return d.depth === 1 ? 0.8 : d.depth === 2 ? 0.6 : 0.9;
      })
      .attr("stroke", "var(--bg-primary)")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .style("transition", "fill-opacity 0.2s")
      .on("mouseenter", function (event, d) {
        d3.select(this).attr("fill-opacity", 1);

        const [cx, cy] = arc.centroid(d as any);
        const svgRect = svgRef.current!.getBoundingClientRect();
        const tooltipX = svgRect.left + svgRect.width / 2 + cx;
        const tooltipY = svgRect.top + svgRect.height / 2 + cy;

        setTooltip({
          show: true,
          x: tooltipX,
          y: tooltipY,
          content: d.data,
        });
      })
      .on("mouseleave", function (_, d) {
        d3.select(this).attr("fill-opacity", () => {
          if (d.data.score !== undefined) {
            return 0.4 + (d.data.score / 100) * 0.6;
          }
          return d.depth === 1 ? 0.8 : d.depth === 2 ? 0.6 : 0.9;
        });
        setTooltip({ show: false, x: 0, y: 0, content: null });
      });

    // Center label
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.3em")
      .style("font-size", "14px")
      .style("font-weight", "700")
      .style("fill", "var(--text-primary)")
      .text("Goal");

    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1em")
      .style("font-size", "14px")
      .style("font-weight", "700")
      .style("fill", "var(--text-primary)")
      .text("Alignment");

    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "2.4em")
      .style("font-size", "11px")
      .style("fill", "var(--text-tertiary)")
      .text(`${root.leaves().length} goals`);
  }, [data]);

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <svg
          ref={svgRef}
          style={{ width: "100%", maxWidth: 520, height: "auto" }}
        />
      </div>

      {/* Tooltip */}
      {tooltip.show && tooltip.content && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y - 60,
            transform: "translateX(-50%)",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            padding: "10px 14px",
            fontSize: 12,
            zIndex: 100,
            pointerEvents: "none",
            boxShadow: "var(--shadow-lg)",
            maxWidth: 250,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: 4,
            }}
          >
            {tooltip.content.name}
          </div>
          {tooltip.content.thrustArea && (
            <div style={{ color: "var(--text-secondary)" }}>
              {tooltip.content.thrustArea}
            </div>
          )}
          {tooltip.content.score !== undefined && (
            <div
              style={{
                color:
                  tooltip.content.score >= 80
                    ? "#00D4AA"
                    : tooltip.content.score >= 50
                    ? "#FFB547"
                    : "#FF5C8A",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
              }}
            >
              Score: {Math.round(tooltip.content.score)}%
            </div>
          )}
          {tooltip.content.value !== undefined && (
            <div style={{ color: "var(--text-tertiary)" }}>
              Weight: {tooltip.content.value}%
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 20,
          marginTop: 16,
        }}
      >
        {[
          { label: "Department", color: DEPTH_COLORS[1] },
          { label: "Employee", color: DEPTH_COLORS[2] },
          { label: "Completed", color: STATUS_COLORS.COMPLETED },
          { label: "On Track", color: STATUS_COLORS.ON_TRACK },
          { label: "Not Started", color: STATUS_COLORS.NOT_STARTED },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              color: "var(--text-secondary)",
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: item.color,
                display: "inline-block",
              }}
            />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
