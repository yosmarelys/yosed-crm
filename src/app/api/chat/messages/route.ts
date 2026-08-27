import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const channelId = req.nextUrl.searchParams.get("channelId");
  if (!channelId) return NextResponse.json({ error: "channelId required" }, { status: 400 });

  const membership = await prisma.channelMember.findUnique({
    where: { channelId_userId: { channelId, userId: session.userId } },
  });
  if (!membership) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const messages = await prisma.chatMessage.findMany({
    where: { channelId },
    orderBy: { createdAt: "asc" },
    take: 200,
    include: { sender: { select: { id: true, name: true, color: true } } },
  });

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const channelId = String(body.channelId || "");
  const text = String(body.body || "").trim();
  if (!channelId || !text) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const membership = await prisma.channelMember.findUnique({
    where: { channelId_userId: { channelId, userId: session.userId } },
  });
  if (!membership) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const message = await prisma.chatMessage.create({
    data: { channelId, senderId: session.userId, body: text.slice(0, 2000) },
    include: { sender: { select: { id: true, name: true, color: true } } },
  });

  return NextResponse.json({ message });
}
