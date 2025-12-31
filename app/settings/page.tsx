import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SettingsForm } from "@/components/settings/settings-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings | POS System",
}

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <SettingsForm />
    </DashboardLayout>
  )
}
