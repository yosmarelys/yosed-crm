import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import { MobileNav } from "@/components/shell/MobileNav";
import type { Role } from "@/lib/constants";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const role = session.role as Role;

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar role={role} />
      <div className="flex min-h-screen flex-col md:pl-[76px]">
        <Topbar name={session.name} role={role} color={session.color} />
        <main className="flex-1 px-4 pb-24 pt-5 md:px-6 md:pb-8">{children}</main>
      </div>
      <MobileNav role={role} />
    </div>
  );
}
