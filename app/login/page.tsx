import { LoginForm } from "@/components/auth/login-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login | POS System",
  description: "Sign in to your account",
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">POS System</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
