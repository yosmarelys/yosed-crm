import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const memberships = await prisma.channelMember.findMany({
    where: { userId: session.userId },
    include: {
      channel: {
        include: {
          members: { include: { user: { select: { id: true, name: true, color: true } } } },
          messages: { orderBy: { createdAt: "desc" }, take: 1, include: { sender: true } },
        },
      },
    },
  });

  const channels = memberships
    .map((m) => {
      const c = m.channel;
      const last = c.messages[0];
      return {
        id: c.id,
        name: c.name,
        members: c.members.map((mm) => mm.user),
        lastMessage: last ? { body: last.body, senderName: last.sender.name, createdAt: last.createdAt } : null,
      };
    })
    .sort((a, b) => {
      const at = a.lastMessage?.createdAt?.getTime() ?? 0;
      const bt = b.lastMessage?.createdAt?.getTime() ?? 0;
      return bt - at;
    });

  return NextResponse.json({ channels });
}
