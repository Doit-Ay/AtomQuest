import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "xlsx";

  const cycle = await prisma.cycle.findFirst({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  if (!cycle) {
    return NextResponse.json({ error: "No active cycle" }, { status: 404 });
  }

  const goalSheets = await prisma.goalSheet.findMany({
    where: { cycleId: cycle.id },
    include: {
      user: true,
      goals: {
        include: { achievements: true },
        orderBy: { sortOrder: "asc" },
      },
      checkIns: true,
    },
  });

  // Build data rows
  const rows = goalSheets.flatMap((gs) =>
    gs.goals.map((goal) => {
      const q1 = goal.achievements.find((a) => a.quarter === "Q1");
      const q2 = goal.achievements.find((a) => a.quarter === "Q2");
      const q3 = goal.achievements.find((a) => a.quarter === "Q3");
      const q4 = goal.achievements.find((a) => a.quarter === "Q4");

      return {
        Employee: gs.user.name,
        Email: gs.user.email,
        Department: gs.user.department,
        "Sheet Status": gs.status,
        Goal: goal.title,
        "Thrust Area": goal.thrustArea,
        UoM: goal.uom,
        Target: goal.target,
        "Weightage (%)": goal.weightage,
        "Q1 Actual": q1?.actualValue ?? "",
        "Q1 Score": q1 ? Math.round(q1.score) : "",
        "Q2 Actual": q2?.actualValue ?? "",
        "Q2 Score": q2 ? Math.round(q2.score) : "",
        "Q3 Actual": q3?.actualValue ?? "",
        "Q3 Score": q3 ? Math.round(q3.score) : "",
        "Q4 Actual": q4?.actualValue ?? "",
        "Q4 Score": q4 ? Math.round(q4.score) : "",
        "Goal Status": goal.status,
        "Is Shared": goal.isShared ? "Yes" : "No",
      };
    })
  );

  if (format === "csv") {
    const headers = Object.keys(rows[0] || {});
    const csvRows = [
      headers.join(","),
      ...rows.map((r) =>
        headers.map((h) => {
          const val = String((r as Record<string, unknown>)[h] ?? "");
          return val.includes(",") ? `"${val}"` : val;
        }).join(",")
      ),
    ];
    return new NextResponse(csvRows.join("\n"), {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=AtmoQuest_${cycle.name.replace(/\s/g, "_")}.csv`,
      },
    });
  }

  // Excel export
  const wb = XLSX.utils.book_new();

  // Sheet 1: Goals & Achievements
  const ws1 = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws1, "Goals & Achievements");

  // Sheet 2: Summary by Employee
  const summaryRows = goalSheets.map((gs) => {
    let totalWeightedScore = 0;
    let totalWeight = 0;
    gs.goals.forEach((goal) => {
      const latest = goal.achievements[goal.achievements.length - 1];
      if (latest) {
        totalWeightedScore += latest.score * goal.weightage;
        totalWeight += goal.weightage;
      }
    });
    return {
      Employee: gs.user.name,
      Department: gs.user.department,
      "Total Goals": gs.goals.length,
      "Sheet Status": gs.status,
      "Weighted Score": totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0,
      "Check-ins Done": gs.checkIns.length,
    };
  });
  const ws2 = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, ws2, "Employee Summary");

  // Sheet 3: Check-in Log
  const checkInRows = goalSheets.flatMap((gs) =>
    gs.checkIns.map((ci) => ({
      Employee: gs.user.name,
      Quarter: ci.quarter,
      Comment: ci.comment,
      Date: ci.conductedAt.toISOString().split("T")[0],
    }))
  );
  if (checkInRows.length > 0) {
    const ws3 = XLSX.utils.json_to_sheet(checkInRows);
    XLSX.utils.book_append_sheet(wb, ws3, "Check-in Log");
  }

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=AtmoQuest_${cycle.name.replace(/\s/g, "_")}.xlsx`,
    },
  });
}
