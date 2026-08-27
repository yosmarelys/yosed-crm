import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ clients: [], leads: [] });

  const [clients, leads] = await Promise.all([
    prisma.client.findMany({
      where: {
        OR: [
          { fullName: { contains: q } },
          { phone: { contains: q } },
        ],
      },
      take: 6,
      orderBy: { lastVisit: "desc" },
    }),
    prisma.lead.findMany({
      where: {
        OR: [
          { firstName: { contains: q } },
          { lastName: { contains: q } },
          { phone: { contains: q } },
        ],
      },
      take: 6,
      orderBy: { date: "desc" },
    }),
  ]);

  return NextResponse.json({ clients, leads });
}
