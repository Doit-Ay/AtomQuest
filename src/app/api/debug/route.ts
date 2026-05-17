// @ts-nocheck
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

export async function GET() {
  const info = {
    DIRECT_URL_set: !!process.env.DIRECT_URL,
    DATABASE_URL_set: !!process.env.DATABASE_URL,
    AUTH_SECRET_set: !!process.env.AUTH_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    dbTest: "not tested",
    userCount: 0,
    error: null as string | null,
  };

  try {
    const connStr = process.env.DATABASE_URL || process.env.DIRECT_URL;
    if (!connStr) {
      info.error = "No connection string found";
      return NextResponse.json(info);
    }

    const adapter = new PrismaPg(connStr);
    const prisma = new PrismaClient({ adapter });
    const count = await prisma.user.count();
    info.dbTest = "success";
    info.userCount = count;
    await prisma.$disconnect();
  } catch (e: any) {
    info.dbTest = "failed";
    info.error = e.message || String(e);
  }

  return NextResponse.json(info);
}
