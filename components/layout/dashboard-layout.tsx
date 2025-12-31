import type React from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import { Sidebar } from "./sidebar"
import { Header } from "./header"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar role={session.role} />
      <div className="lg:pl-64">
        <Header user={{ name: session.name, email: session.email, role: session.role }} />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
