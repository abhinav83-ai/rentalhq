
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Zap,
  Book,
  CreditCard,
  Users,
  MessageSquareWarning,
  type LucideIcon,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useData } from "@/context/data-context";
import { Badge } from "@/components/ui/badge";

type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const navLinks: NavLink[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/generators", label: "Generators", icon: Zap },
  { href: "/admin/bookings", label: "Bookings", icon: Book },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquareWarning },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/customers", label: "Customers", icon: Users },
];

export function NavLinks() {
  const pathname = usePathname();
  const { inquiries } = useData();

  const newInquiriesCount = inquiries.filter(i => i.status === 'New').length;

  return (
    <SidebarMenu>
      {navLinks.map((link) => {
        const isActive = pathname.startsWith(link.href) && link.href !== '/';
        const isİnquiriesLink = link.label === "Inquiries";

        return (
          <SidebarMenuItem key={link.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={{ children: link.label }}
            >
              <Link href={link.href} className="flex justify-between items-center w-full">
                <div className="flex items-center gap-2">
                    <link.icon />
                    <span>{link.label}</span>
                </div>
                {isİnquiriesLink && newInquiriesCount > 0 && (
                    <Badge className="h-5 w-5 p-0 flex items-center justify-center">{newInquiriesCount}</Badge>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
