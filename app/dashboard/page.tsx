import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | POS System",
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  )
}
