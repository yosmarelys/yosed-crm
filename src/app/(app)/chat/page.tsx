import { getSession } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { ChatClient } from "./ChatClient";

export default async function ChatPage() {
  const session = await getSession();

  return (
    <div>
      <PageHeader title="Chat interno" subtitle="Coordina con tu equipo en tiempo real" />
      <ChatClient currentUserId={session!.userId} />
    </div>
  );
}
