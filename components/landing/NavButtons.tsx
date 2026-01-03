"use client";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import Link from "next/link";

export default function NavButtons() {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="hidden sm:flex items-center gap-3"
    >
      <Button
        variant="ghost"
        className="text-xs font-black uppercase tracking-widest"
        asChild
      >
        <Link href="/login">Log in</Link>
      </Button>
      <Button
        className="rounded-full px-6 font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/10 transition-transform active:scale-95 hover:bg-primary/60"
        asChild
      >
        <Link href="/register">Start Free Trial</Link>
      </Button>
    </motion.div>
  );
}
