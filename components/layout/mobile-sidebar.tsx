"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { hasPermission } from "@/lib/utils/permissions";
import type { UserRole } from "@/lib/db/models";
import { Package } from "lucide-react";
import {
  LayoutDashboard,
  ShoppingCart,
  Warehouse,
  Users,
  UserCircle,
  Truck,
  BarChart3,
  Settings,
  ClipboardList,
} from "lucide-react";
import Image from "next/image";

interface MobileSidebarProps {
  role: UserRole;
}

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    permission: "view_dashboard" as const,
  },
  {
    href: "/pos",
    label: "Point of Sale",
    icon: ShoppingCart,
    permission: "process_sales" as const,
  },
  {
    href: "/products",
    label: "Products",
    icon: Package,
    permission: "manage_products" as const,
  },
  {
    href: "/inventory",
    label: "Inventory",
    icon: Warehouse,
    permission: "manage_inventory" as const,
  },
  {
    href: "/suppliers",
    label: "Suppliers",
    icon: Truck,
    permission: "manage_suppliers" as const,
  },
  {
    href: "/customers",
    label: "Customers",
    icon: UserCircle,
    permission: "manage_customers" as const,
  },
  {
    href: "/employees",
    label: "Employees",
    icon: Users,
    permission: "manage_employees" as const,
  },
  {
    href: "/reports",
    label: "Reports",
    icon: BarChart3,
    permission: "view_reports" as const,
  },
  {
    href: "/audit-logs",
    label: "Audit Logs",
    icon: ClipboardList,
    permission: "view_audit_logs" as const,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    permission: "manage_settings" as const,
  },
];

export function MobileSidebar({ role }: MobileSidebarProps) {
  const pathname = usePathname();
  const filteredItems = navItems.filter((item) =>
    hasPermission(role, item.permission)
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href={"/dashboard"}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Image
            src={"/logo.svg"}
            alt="Logo"
            className="w-8 h-8 rounded-md"
            width={8}
            height={8}
          />
          <span className="text-2xl font-black tracking-tighter">Inventra</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {filteredItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
