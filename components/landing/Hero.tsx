"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { fadeIn, staggerContainer } from "@/lib/motion-variants";
import Image from "next/image";

export function Hero() {
  return (
    <section className="py-20 lg:pb-20 lg:py-10 overflow-hidden">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="container grid lg:grid-cols-2 gap-8 items-center"
      >
        <motion.div variants={fadeIn} className="flex flex-col gap-2">
          <Badge
            variant="secondary"
            className="w-fit px-3 py-1 text-xs font-semibold uppercase tracking-wider"
          >
            Enterprise Grade POS
          </Badge>
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
            Run Your Store Faster with a{" "}
            <span className="text-primary">Smart Inventory POS</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-[540px]">
            Track inventory, scan barcodes, manage sales, and checkout customers
            — all in one fast, simple POS system built for retail.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button
              size="lg"
              className="h-12 px-8 text-base rounded-full"
              asChild
            >
              <Link href="/register">
                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 text-base rounded-full bg-transparent"
              asChild
            >
              <Link href="#demo">View Demo</Link>
            </Button>
          </div>
          <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <div className="h-1 w-1 rounded-full bg-primary" /> No credit card
              required
            </span>
            <span className="flex items-center gap-1.5">
              <div className="h-1 w-1 rounded-full bg-primary" /> Used by 500+
              stores
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative"
        >
          <div className="relative z-10 bg-background border rounded-2xl shadow-2xl overflow-hidden aspect-[4/3.4] flex flex-col w-full">
            {/* Mock POS UI */}
            <div className="h-12 border-b bg-muted/50 flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-destructive/20" />
                <div className="h-3 w-3 rounded-full bg-warning/20" />
                <div className="h-3 w-3 rounded-full bg-success/20" />
              </div>
              <div className="text-xs font-medium text-muted-foreground">
                Terminal 01 - Cashier: Bulbul
              </div>
            </div>
            <Image
              src="/pos.png"
              alt="POs"
              className="w-full h-full"
              width={100}
              height={100}
            />
          </div>
          {/* Decorative gradients */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl -z-10" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl -z-10" />
        </motion.div>
      </motion.div>
    </section>
  );
}
