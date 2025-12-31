import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ReportsDashboard } from "@/components/reports/reports-dashboard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reports | POS System",
}

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <ReportsDashboard />
    </DashboardLayout>
  )
}
