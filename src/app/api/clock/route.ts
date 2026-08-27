import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

async function summarize(userId: string) {
  const date = todayStr();
  const entries = await prisma.timeEntry.findMany({
    where: { userId, date },
    orderBy: { clockIn: "asc" },
  });
  const open = entries.find((e) => !e.clockOut);
  let closedSeconds = 0;
  for (const e of entries) {
    if (!e.clockOut) continue;
    closedSeconds += Math.max(0, (e.clockOut.getTime() - e.clockIn.getTime()) / 1000);
  }
  return {
    active: Boolean(open),
    since: open ? open.clockIn.toISOString() : null,
    todaySeconds: Math.round(closedSeconds),
    entries: entries.map((e) => ({
      id: e.id,
      clockIn: e.clockIn.toISOString(),
      clockOut: e.clockOut ? e.clockOut.toISOString() : null,
    })),
  };
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const data = await summarize(session.userId);
  return NextResponse.json(data);
}

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const date = todayStr();
  const open = await prisma.timeEntry.findFirst({
    where: { userId: session.userId, date, clockOut: null },
    orderBy: { clockIn: "desc" },
  });

  if (open) {
    await prisma.timeEntry.update({ where: { id: open.id }, data: { clockOut: new Date() } });
  } else {
    await prisma.timeEntry.create({
      data: { userId: session.userId, date, clockIn: new Date() },
    });
  }

  const data = await summarize(session.userId);
  return NextResponse.json(data);
}
