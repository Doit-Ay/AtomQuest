const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");

const adapter = new PrismaPg(process.env.DIRECT_URL || process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.goalSheet.deleteMany();
  await prisma.cycle.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("password123", 10);

  // Create users
  const admin = await prisma.user.create({
    data: {
      email: "admin@atmoquest.dev",
      name: "Priya Sharma",
      password,
      role: "ADMIN",
      department: "Human Resources",
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: "manager@atmoquest.dev",
      name: "Rajesh Kumar",
      password,
      role: "MANAGER",
      department: "Engineering",
    },
  });

  const employee1 = await prisma.user.create({
    data: {
      email: "employee@atmoquest.dev",
      name: "Aditya Singh",
      password,
      role: "EMPLOYEE",
      department: "Engineering",
      managerId: manager.id,
    },
  });

  const employee2 = await prisma.user.create({
    data: {
      email: "neha@atmoquest.dev",
      name: "Neha Gupta",
      password,
      role: "EMPLOYEE",
      department: "Engineering",
      managerId: manager.id,
    },
  });

  const employee3 = await prisma.user.create({
    data: {
      email: "arjun@atmoquest.dev",
      name: "Arjun Patel",
      password,
      role: "EMPLOYEE",
      department: "Engineering",
      managerId: manager.id,
    },
  });

  console.log("✅ Users created");

  // Create cycle
  const cycle = await prisma.cycle.create({
    data: {
      name: "FY 2026-27",
      year: 2026,
      startDate: new Date("2026-05-01"),
      endDate: new Date("2027-04-30"),
      status: "ACTIVE",
    },
  });

  console.log("✅ Cycle created");

  // Create goal sheet for employee1 (Approved)
  const goalSheet1 = await prisma.goalSheet.create({
    data: {
      userId: employee1.id,
      cycleId: cycle.id,
      status: "APPROVED",
      submittedAt: new Date("2026-05-05"),
      approvedAt: new Date("2026-05-07"),
      isLocked: true,
    },
  });

  const goal1 = await prisma.goal.create({
    data: {
      goalSheetId: goalSheet1.id,
      thrustArea: "Revenue Growth",
      title: "Increase API Response Speed",
      description: "Optimize core API endpoints to reduce p95 latency by 40%",
      uom: "PERCENTAGE_MIN",
      target: 40,
      weightage: 25,
      status: "ON_TRACK",
      sortOrder: 0,
    },
  });

  const goal2 = await prisma.goal.create({
    data: {
      goalSheetId: goalSheet1.id,
      thrustArea: "Innovation & Technology",
      title: "Implement CI/CD Pipeline",
      description: "Set up automated deployment pipeline with staging and production environments",
      uom: "TIMELINE",
      target: new Date("2026-09-30").getTime(),
      targetDate: new Date("2026-09-30"),
      weightage: 20,
      status: "ON_TRACK",
      sortOrder: 1,
    },
  });

  const goal3 = await prisma.goal.create({
    data: {
      goalSheetId: goalSheet1.id,
      thrustArea: "Quality & Compliance",
      title: "Zero Critical Production Bugs",
      description: "Maintain zero critical severity bugs in production",
      uom: "ZERO",
      target: 0,
      weightage: 15,
      status: "ON_TRACK",
      sortOrder: 2,
    },
  });

  const goal4 = await prisma.goal.create({
    data: {
      goalSheetId: goalSheet1.id,
      thrustArea: "People & Culture",
      title: "Mentor Junior Developers",
      description: "Conduct weekly code review sessions and mentor 2 junior developers",
      uom: "NUMERIC_MIN",
      target: 48,
      weightage: 15,
      status: "NOT_STARTED",
      sortOrder: 3,
    },
  });

  const goal5 = await prisma.goal.create({
    data: {
      goalSheetId: goalSheet1.id,
      thrustArea: "Operational Excellence",
      title: "Reduce Infrastructure Costs",
      description: "Optimize cloud resource usage to reduce monthly infra cost",
      uom: "NUMERIC_MAX",
      target: 15000,
      weightage: 25,
      status: "ON_TRACK",
      sortOrder: 4,
    },
  });

  console.log("✅ Goal Sheet 1 created (Approved)");

  // Add Q1 achievements
  await prisma.achievement.createMany({
    data: [
      { goalId: goal1.id, quarter: "Q1", plannedTarget: 10, actualValue: 12, score: 120 },
      { goalId: goal2.id, quarter: "Q1", plannedTarget: 25, actualValue: 20, score: 80 },
      { goalId: goal3.id, quarter: "Q1", plannedTarget: 0, actualValue: 0, score: 100 },
      { goalId: goal4.id, quarter: "Q1", plannedTarget: 12, actualValue: 8, score: 67 },
      { goalId: goal5.id, quarter: "Q1", plannedTarget: 18000, actualValue: 16500, score: 109 },
    ],
  });

  console.log("✅ Q1 Achievements created");

  // Goal sheet for employee2 (Submitted - pending approval)
  const goalSheet2 = await prisma.goalSheet.create({
    data: {
      userId: employee2.id,
      cycleId: cycle.id,
      status: "SUBMITTED",
      submittedAt: new Date("2026-05-10"),
    },
  });

  await prisma.goal.createMany({
    data: [
      {
        goalSheetId: goalSheet2.id,
        thrustArea: "Customer Satisfaction",
        title: "Improve NPS Score",
        description: "Increase Net Promoter Score from 45 to 65",
        uom: "NUMERIC_MIN",
        target: 65,
        weightage: 30,
        sortOrder: 0,
      },
      {
        goalSheetId: goalSheet2.id,
        thrustArea: "Operational Excellence",
        title: "Reduce Bug Resolution Time",
        description: "Average bug resolution time from 48h to 24h",
        uom: "NUMERIC_MAX",
        target: 24,
        weightage: 25,
        sortOrder: 1,
      },
      {
        goalSheetId: goalSheet2.id,
        thrustArea: "Innovation & Technology",
        title: "Launch Feature Flags System",
        description: "Implement feature flag infrastructure for safe releases",
        uom: "TIMELINE",
        target: new Date("2026-08-31").getTime(),
        targetDate: new Date("2026-08-31"),
        weightage: 20,
        sortOrder: 2,
      },
      {
        goalSheetId: goalSheet2.id,
        thrustArea: "Quality & Compliance",
        title: "Code Coverage Target",
        description: "Achieve 85% code coverage across all services",
        uom: "PERCENTAGE_MIN",
        target: 85,
        weightage: 25,
        sortOrder: 3,
      },
    ],
  });

  console.log("✅ Goal Sheet 2 created (Submitted)");

  // Goal sheet for employee3 (Draft)
  const goalSheet3 = await prisma.goalSheet.create({
    data: {
      userId: employee3.id,
      cycleId: cycle.id,
      status: "DRAFT",
    },
  });

  await prisma.goal.createMany({
    data: [
      {
        goalSheetId: goalSheet3.id,
        thrustArea: "Revenue Growth",
        title: "Build Payment Integration",
        description: "Integrate Razorpay payment gateway for subscription module",
        uom: "TIMELINE",
        target: new Date("2026-07-31").getTime(),
        targetDate: new Date("2026-07-31"),
        weightage: 35,
        sortOrder: 0,
      },
      {
        goalSheetId: goalSheet3.id,
        thrustArea: "Customer Satisfaction",
        title: "Reduce Onboarding Drop-off",
        description: "Decrease user drop-off rate during onboarding from 35% to 15%",
        uom: "PERCENTAGE_MAX",
        target: 15,
        weightage: 30,
        sortOrder: 1,
      },
    ],
  });

  console.log("✅ Goal Sheet 3 created (Draft)");

  // Check-in
  await prisma.checkIn.create({
    data: {
      goalSheetId: goalSheet1.id,
      managerId: manager.id,
      quarter: "Q1",
      comment:
        "Good progress on API optimization. CI/CD pipeline is slightly behind schedule but recoverable. Keep up the momentum on zero-bug target.",
    },
  });

  console.log("✅ Check-in created");

  // Audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: employee1.id,
        action: "CREATED",
        entityType: "GOAL_SHEET",
        entityId: goalSheet1.id,
        newValue: JSON.stringify({ status: "DRAFT" }),
      },
      {
        userId: employee1.id,
        action: "UPDATED",
        entityType: "GOAL_SHEET",
        entityId: goalSheet1.id,
        previousValue: JSON.stringify({ status: "DRAFT" }),
        newValue: JSON.stringify({ status: "SUBMITTED" }),
      },
      {
        userId: manager.id,
        action: "APPROVED",
        entityType: "GOAL_SHEET",
        entityId: goalSheet1.id,
        previousValue: JSON.stringify({ status: "SUBMITTED" }),
        newValue: JSON.stringify({ status: "APPROVED" }),
      },
    ],
  });

  console.log("✅ Audit logs created");
  console.log("\n🎉 Seed complete!");
  console.log("\n📧 Login credentials (all passwords: password123):");
  console.log("   Employee: employee@atmoquest.dev");
  console.log("   Manager:  manager@atmoquest.dev");
  console.log("   Admin:    admin@atmoquest.dev");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
