import { RegisterForm } from "@/components/auth/register-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register - Inventra",
  description: "Create a new account in Inventra",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">POS System</h1>
          <p className="text-muted-foreground mt-2">Create your account</p>
        </div>
        <RegisterForm />
      </div>
    </main>
  );
}
