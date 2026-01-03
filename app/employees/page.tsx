import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { EmployeeList } from "@/components/employees/employee-list"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Employees | Inventra POS Management",
  description:'Manage employee roles, permissions, and activity to keep operations secure and organized.'
}

export default function EmployeesPage() {
  return (
    <DashboardLayout>
      <EmployeeList />
    </DashboardLayout>
  )
}
