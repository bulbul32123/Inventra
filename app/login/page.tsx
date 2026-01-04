import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Login - Inventra | Complete Inventory & Point of Sale System",
  description: "Sign in to your account",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 cursor-pointer">
            <Image
              src={"/logo.svg"}
              alt="Logo"
              className="w-10 h-10 rounded-md"
              width={8}
              height={8}
            />
            <span className="text-4xl font-black tracking-tighter">
              Inventra
            </span>
          </div>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
