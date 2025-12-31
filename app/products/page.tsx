import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProductList } from "@/components/products/product-list"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Products | POS System",
}

export default function ProductsPage() {
  return (
    <DashboardLayout>
      <ProductList />
    </DashboardLayout>
  )
}
