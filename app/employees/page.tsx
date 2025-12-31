import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { EmployeeList } from "@/components/employees/employee-list"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Employees | POS System",
}

export default function EmployeesPage() {
  return (
    <DashboardLayout>
      <EmployeeList />
    </DashboardLayout>
  )
}
