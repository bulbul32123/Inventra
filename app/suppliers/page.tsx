import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SupplierList } from "@/components/suppliers/supplier-list"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Suppliers | POS System",
}

export default function SuppliersPage() {
  return (
    <DashboardLayout>
      <SupplierList />
    </DashboardLayout>
  )
}
