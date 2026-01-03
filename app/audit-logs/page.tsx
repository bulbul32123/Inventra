import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AuditLogList } from "@/components/audit/audit-log-list"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Audit Logs | Inventra Inventory System",
  description:"Maintain full transparency with detailed audit logs tracking system activities, changes, and user actions."
}

export default function AuditLogsPage() {
  return (
    <DashboardLayout>
      <AuditLogList />
    </DashboardLayout>
  )
}
