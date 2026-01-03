"use client";

import { motion } from "framer-motion";
import { fadeIn, scaleIn } from "@/lib/motion-variants";
import { Badge } from "@/components/ui/badge";

export function UIPreview() {
  return (
    <section className="py-24 bg-muted/30 overflow-hidden">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-4 px-4"
        >
          <Badge
            variant="outline"
            className="w-fit mx-auto px-3 py-1 text-xs font-semibold uppercase tracking-wider border-primary text-black"
          >
            Dashboard Preview
          </Badge>
          <h2 className="text-3xl font-black tracking-tight sm:text-5xl leading-tight">
            Manage Your Entire Business from a Single Screen
          </h2>
          <p className="text-muted-foreground text-lg lg:text-xl">
            Powerful analytics and management tools that give you a 360-degree
            view of your store performance.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={scaleIn}
          className="relative mx-auto max-w-6xl"
        >
          <div className="bg-background border rounded-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.12)] overflow-hidden border-primary/20">
            {/* Mock Dashboard UI */}
            <img src="/dashboard.png" alt="POs" />
          </div>
          {/* Background glows */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
        </motion.div>
      </div>
    </section>
  );
}
