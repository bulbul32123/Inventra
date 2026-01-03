import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SupplierList } from "@/components/suppliers/supplier-list"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Suppliers | Inventra Inventory Management",
  description:'Manage suppliers, purchase records, and stock sourcing to ensure smooth inventory replenishment.'
}

export default function SuppliersPage() {
  return (
    <DashboardLayout>
      <SupplierList />
    </DashboardLayout>
  )
}
