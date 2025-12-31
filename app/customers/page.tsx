import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CustomerList } from "@/components/customers/customer-list"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Customers | POS System",
}

export default function CustomersPage() {
  return (
    <DashboardLayout>
      <CustomerList />
    </DashboardLayout>
  )
}
