import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AnalyticsClient } from "./analytics-client";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session) return null;

  const cycle = await prisma.cycle.findFirst({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  if (!cycle) {
    return (
      <div className="empty-state">
        <div className="empty-state-title">No active cycle</div>
      </div>
    );
  }

  const goalSheets = await prisma.goalSheet.findMany({
    where: { cycleId: cycle.id, status: "APPROVED" },
    include: {
      user: true,
      goals: {
        include: { achievements: true },
        orderBy: { sortOrder: "asc" },
      },
      checkIns: true,
    },
  });

  // Build analytics data
  // 1. QoQ trend data
  const quarters = ["Q1", "Q2", "Q3", "Q4"];
  const qoqTrend = quarters.map((q) => {
    let totalScore = 0;
    let count = 0;
    goalSheets.forEach((gs) => {
      gs.goals.forEach((goal) => {
        const ach = goal.achievements.find((a) => a.quarter === q);
        if (ach) {
          totalScore += ach.score;
          count++;
        }
      });
    });
    return {
      quarter: q,
      avgScore: count > 0 ? Math.round(totalScore / count) : 0,
      goalCount: count,
    };
  });

  // 2. Thrust Area distribution
  const thrustAreaMap: Record<string, { count: number; totalWeight: number }> = {};
  goalSheets.forEach((gs) => {
    gs.goals.forEach((goal) => {
      if (!thrustAreaMap[goal.thrustArea]) {
        thrustAreaMap[goal.thrustArea] = { count: 0, totalWeight: 0 };
      }
      thrustAreaMap[goal.thrustArea].count++;
      thrustAreaMap[goal.thrustArea].totalWeight += goal.weightage;
    });
  });
  const thrustAreaData = Object.entries(thrustAreaMap).map(([name, data]) => ({
    name: name.length > 18 ? name.slice(0, 16) + "…" : name,
    fullName: name,
    count: data.count,
    totalWeight: Math.round(data.totalWeight),
  }));

  // 3. Employee performance comparison
  const employeePerf = goalSheets.map((gs) => {
    const totalGoals = gs.goals.length;
    let totalWeightedScore = 0;
    let totalWeight = 0;

    gs.goals.forEach((goal) => {
      const latestAch = goal.achievements[goal.achievements.length - 1];
      if (latestAch) {
        totalWeightedScore += latestAch.score * goal.weightage;
        totalWeight += goal.weightage;
      }
    });

    const weightedAvg = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    return {
      name: gs.user.name.split(" ")[0],
      fullName: gs.user.name,
      department: gs.user.department,
      goals: totalGoals,
      score: Math.round(weightedAvg),
      checkIns: gs.checkIns.length,
    };
  });

  // 4. Status distribution
  const statusCounts = { NOT_STARTED: 0, ON_TRACK: 0, COMPLETED: 0 };
  goalSheets.forEach((gs) => {
    gs.goals.forEach((goal) => {
      if (goal.status in statusCounts) {
        statusCounts[goal.status as keyof typeof statusCounts]++;
      }
    });
  });
  const statusData = [
    { name: "Not Started", value: statusCounts.NOT_STARTED, color: "#FF5C8A" },
    { name: "On Track", value: statusCounts.ON_TRACK, color: "#7C5CFC" },
    { name: "Completed", value: statusCounts.COMPLETED, color: "#00D4AA" },
  ];

  // 5. Sunburst data for org alignment
  const sunburstData = {
    name: "Organization",
    children: Object.entries(
      goalSheets.reduce(
        (acc, gs) => {
          const dept = gs.user.department;
          if (!acc[dept]) acc[dept] = [];
          acc[dept].push(gs);
          return acc;
        },
        {} as Record<string, typeof goalSheets>
      )
    ).map(([dept, sheets]) => ({
      name: dept,
      children: sheets.map((gs) => ({
        name: gs.user.name,
        children: gs.goals.map((goal) => {
          const latestAch = goal.achievements[goal.achievements.length - 1];
          return {
            name: goal.title,
            value: goal.weightage,
            score: latestAch?.score || 0,
            status: goal.status,
            thrustArea: goal.thrustArea,
          };
        }),
      })),
    })),
  };

  return (
    <AnalyticsClient
      qoqTrend={qoqTrend}
      thrustAreaData={thrustAreaData}
      employeePerf={employeePerf}
      statusData={statusData}
      sunburstData={sunburstData}
      cycleName={cycle.name}
    />
  );
}
