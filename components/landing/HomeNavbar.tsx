"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Package2, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from "react-scroll";
import NavButtons from "./NavButtons";
import Image from "next/image";

export function HomeNavbar() {
  const navLinks = [
    { name: "feature", href: "#features", label: "Features" },
    { name: "use-cases", href: "#use-cases", label: "Industries" },
    { name: "pricing", href: "#pricing", label: "Pricing" },
    { name: "faq", href: "#faq", label: "FAQ" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-20 items-center justify-between px-6">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className=""
        >
          <Link
            to="home"
            smooth={true}
            duration={500}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Image
              src={"/logo.svg"}
              alt="Logo"
              className="w-8 h-8 rounded-md"
              width={8}
              height={8}
            />
            <span className="text-2xl font-black tracking-tighter">
              Inventra
            </span>
          </Link>
        </motion.div>

        <nav className="hidden lg:flex items-center gap-10 text-xs font-black uppercase tracking-widest text-muted-foreground">
          {navLinks.map((link, i) => (
            <motion.div
              key={i}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 * i }}
              className="cursor-pointer"
            >
              <Link
                key={link.href}
                to={link.name}
                smooth={true}
                duration={500}
                className="hover:text-black transition-colors py-2"
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <NavButtons />

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-full"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader className="text-left mb-8">
                <SheetTitle className="text-2xl font-black tracking-tighter flex items-center gap-2">
                  <Package2 className="h-6 w-6 text-primary" />
                  StockFlow
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-6 text-lg font-black uppercase tracking-widest">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.name}
                    smooth={true}
                    duration={500}
                    className="hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="h-px bg-muted my-4" />
                <Link href="/login" className="hover:text-primary">
                  Log in
                </Link>
                <Link href="/register" className="text-primary">
                  Start Free Trial
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
