import type { Role } from "@/lib/constants";
import {
  LayoutGrid,
  Users,
  Target,
  Receipt,
  Tag,
  Clock,
  MessageCircle,
  PenTool,
  Megaphone,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: Role[];
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Panel", icon: LayoutGrid },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/leads", label: "Pipeline", icon: Target, roles: ["ADMIN", "VENTAS"] },
  { href: "/facturacion", label: "Facturación", icon: Receipt, roles: ["ADMIN", "VENTAS"] },
  { href: "/servicios", label: "Servicios", icon: Tag, roles: ["ADMIN", "VENTAS"] },
  { href: "/asistencia", label: "Asistencia", icon: Clock },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/diseno", label: "Diseño", icon: PenTool, roles: ["ADMIN", "DISENO", "CAMPANAS"] },
  { href: "/campanas", label: "Campañas", icon: Megaphone, roles: ["ADMIN", "CAMPANAS"] },
  { href: "/automatizaciones", label: "Automatización", icon: Zap, roles: ["ADMIN"] },
];

export function visibleNavItems(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));
}
