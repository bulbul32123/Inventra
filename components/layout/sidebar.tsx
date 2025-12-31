"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { hasPermission } from "@/lib/utils/permissions"
import type { UserRole } from "@/lib/db/models"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  Users,
  UserCircle,
  Truck,
  BarChart3,
  Settings,
  ClipboardList,
} from "lucide-react"

interface SidebarProps {
  role: UserRole
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, permission: "view_dashboard" as const },
  { href: "/pos", label: "Point of Sale", icon: ShoppingCart, permission: "process_sales" as const },
  { href: "/products", label: "Products", icon: Package, permission: "manage_products" as const },
  { href: "/inventory", label: "Inventory", icon: Warehouse, permission: "manage_inventory" as const },
  { href: "/suppliers", label: "Suppliers", icon: Truck, permission: "manage_suppliers" as const },
  { href: "/customers", label: "Customers", icon: UserCircle, permission: "manage_customers" as const },
  { href: "/employees", label: "Employees", icon: Users, permission: "manage_employees" as const },
  { href: "/reports", label: "Reports", icon: BarChart3, permission: "view_reports" as const },
  { href: "/audit-logs", label: "Audit Logs", icon: ClipboardList, permission: "view_audit_logs" as const },
  { href: "/settings", label: "Settings", icon: Settings, permission: "manage_settings" as const },
]

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()

  const filteredItems = navItems.filter((item) => hasPermission(role, item.permission))

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r bg-card lg:block">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">POS System</span>
        </Link>
      </div>
      <nav className="space-y-1 p-4">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
