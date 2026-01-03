import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | Inventra POS & Inventory System",
  description: 'Get a real-time overview of sales, inventory, revenue, and performance metrics—all in one centralized dashboard.'
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  )
}
