import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AuditLogList } from "@/components/audit/audit-log-list"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Audit Logs | POS System",
}

export default function AuditLogsPage() {
  return (
    <DashboardLayout>
      <AuditLogList />
    </DashboardLayout>
  )
}
