import type { UserRole } from "@/lib/db/models"

type Permission =
  | "view_dashboard"
  | "manage_products"
  | "manage_inventory"
  | "manage_suppliers"
  | "manage_customers"
  | "manage_employees"
  | "view_reports"
  | "manage_settings"
  | "process_sales"
  | "process_refunds"
  | "view_audit_logs"

const rolePermissions: Record<UserRole, Permission[]> = {
  owner: [
    "view_dashboard",
    "manage_products",
    "manage_inventory",
    "manage_suppliers",
    "manage_customers",
    "manage_employees",
    "view_reports",
    "manage_settings",
    "process_sales",
    "process_refunds",
    "view_audit_logs",
  ],
  manager: [
    "view_dashboard",
    "manage_products",
    "manage_inventory",
    "manage_suppliers",
    "manage_customers",
    "view_reports",
    "process_sales",
    "process_refunds",
  ],
  cashier: ["process_sales", "view_dashboard"],
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false
}

export function getPermissions(role: UserRole): Permission[] {
  return rolePermissions[role] ?? []
}

export function canAccessRoute(role: UserRole, route: string): boolean {
  const routePermissions: Record<string, Permission> = {
    "/dashboard": "view_dashboard",
    "/products": "manage_products",
    "/inventory": "manage_inventory",
    "/suppliers": "manage_suppliers",
    "/customers": "manage_customers",
    "/employees": "manage_employees",
    "/reports": "view_reports",
    "/settings": "manage_settings",
    "/pos": "process_sales",
    "/audit-logs": "view_audit_logs",
  }

  const requiredPermission = routePermissions[route]
  if (!requiredPermission) return true

  return hasPermission(role, requiredPermission)
}
