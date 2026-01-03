import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProductList } from "@/components/products/product-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products | Inventra POS & Inventory Management",
  description:
    "Manage products with pricing, categories, SKUs, and stock levels. Keep your catalog accurate and sales-ready at all times.",
};

export default function ProductsPage() {
  return (
    <DashboardLayout>
      <ProductList />
    </DashboardLayout>
  );
}
