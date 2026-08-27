import { GlobalSearch } from "./GlobalSearch";
import { ClockWidget } from "./ClockWidget";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";
import type { Role } from "@/lib/constants";

export function Topbar({
  name,
  role,
  color,
}: {
  name: string;
  role: Role;
  color: string;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-black/[0.06] bg-white/75 px-4 backdrop-blur-xl md:px-6">
      <GlobalSearch />
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <ClockWidget />
        <NotificationBell />
        <div className="h-6 w-px bg-black/[0.08]" />
        <UserMenu name={name} role={role} color={color} />
      </div>
    </header>
  );
}
