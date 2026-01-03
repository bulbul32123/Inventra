"use client";
import { motion } from "framer-motion";
import { Scan, RefreshCw, CreditCard } from "lucide-react";
import { Badge } from "../ui/badge";
import { fadeIn, staggerContainer } from "@/lib/motion-variants";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="container"
      >
        <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-4 px-4">
          <Badge
            variant="outline"
            className="w-fit mx-auto px-3 py-1 text-xs font-semibold uppercase tracking-wider border-primary text-black"
          >
            How it works
          </Badge>
          <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
            Loved by Business Owners
          </h2>
        </div>
        <div className="grid lg:grid-cols-3 gap-12 relative">
          {/* Step 1 */}
          <motion.div
            variants={fadeIn}
            className="flex flex-col items-center text-center gap-4 group"
          >
            <div className="h-16 w-16 rounded-full bg-background border-2 border-primary flex items-center justify-center text-2xl font-black z-10">
              <Scan className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">1. Scan Products</h3>
            <p className="text-muted-foreground leading-relaxed">
              Use a barcode scanner or search to quickly add items to the
              customer's cart.
            </p>
          </motion.div>
          {/* Step 2 */}
          <motion.div  variants={fadeIn} className="flex flex-col items-center text-center gap-4 group">
            <div className="h-16 w-16 rounded-full bg-background border-2 border-primary flex items-center justify-center text-2xl font-black z-10">
              <RefreshCw className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">2. Manage Inventory</h3>
            <p className="text-muted-foreground leading-relaxed">
              Stock levels adjust automatically in real-time. Receive low-stock
              alerts instantly.
            </p>
          </motion.div>
          {/* Step 3 */}
          <motion.div  variants={fadeIn} className="flex flex-col items-center text-center gap-4 group">
            <div className="h-16 w-16 rounded-full bg-background border-2 border-primary flex items-center justify-center text-2xl font-black z-10">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">3. Checkout Customers</h3>
            <p className="text-muted-foreground leading-relaxed">
              Process payments quickly via cash, card, or mobile. Print or email
              professional receipts.
            </p>
          </motion.div>
          {/* Connector Line (Desktop Only) */}
          <div className="hidden lg:block absolute top-8 left-0 right-0 h-[2px] bg-primary/10 -z-0" />
        </div>
      </motion.div>
    </section>
  );
}
