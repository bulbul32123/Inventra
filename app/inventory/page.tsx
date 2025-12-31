import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { InventoryManagement } from "@/components/inventory/inventory-management"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Inventory | POS System",
}

export default function InventoryPage() {
  return (
    <DashboardLayout>
      <InventoryManagement />
    </DashboardLayout>
  )
}
