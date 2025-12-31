import { getSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { POSTerminal } from "@/components/pos/pos-terminal"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Point of Sale | POS System",
}

export default async function POSPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return <POSTerminal cashier={{ id: session.userId, name: session.name }} />
}
