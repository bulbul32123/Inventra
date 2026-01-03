import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SettingsForm } from "@/components/settings/settings-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings | Inventra System Configuration",
  description:'Configure system preferences, taxes, payments, roles, and business settings to match your workflow.'
}

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <SettingsForm />
    </DashboardLayout>
  )
}
