import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CustomerList } from "@/components/customers/customer-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customers | Inventra POS System",
  description:
    "Track customer profiles, purchase history, and engagement to build stronger customer relationships.",
};

export default function CustomersPage() {
  return (
    <DashboardLayout>
      <CustomerList />
    </DashboardLayout>
  );
}
