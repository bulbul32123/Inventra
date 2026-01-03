import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { InventoryManagement } from "@/components/inventory/inventory-management"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Inventory Management | Inventra",
  description: 'Track stock levels, monitor movement, prevent shortages, and manage inventory efficiently across all products and locations.'
}

export default function InventoryPage() {
  return (
    <DashboardLayout>
      <InventoryManagement />
    </DashboardLayout>
  )
}
