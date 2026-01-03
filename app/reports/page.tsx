import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ReportsDashboard } from "@/components/reports/reports-dashboard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reports & Analytics | Inventra POS",
  description: 'Analyze sales trends, profits, inventory turnover, and business performance with detailed, actionable reports.'
}

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <ReportsDashboard />
    </DashboardLayout>
  )
}
