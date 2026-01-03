"use client";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import Link from "next/link";
import { fadeIn } from "@/lib/motion-variants";

export default function CTA() {
  return (
    <section className="py-32 lg:py-48 relative overflow-hidden bg-primary text-primary-foreground">
      <div className="container relative z-10 text-center max-w-4xl mx-auto flex flex-col gap-10 px-6">
        <motion.h2
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-5xl lg:text-8xl font-black tracking-tighter leading-[0.9]"
        >
          Scale Your Shop <br /> Without the Stress.
        </motion.h2>
        <motion.p
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-xl lg:text-2xl font-medium opacity-90 leading-relaxed max-w-2xl mx-auto"
        >
          Join 500+ store owners who have reclaimed their time with Inventra.
          Get started for free today.
        </motion.p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <motion.span
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Button
              size="lg"
              variant="secondary"
              className="h-16 px-12 text-xl font-black rounded-full transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-black/10"
              asChild
            >
              <Link href="/register">Start Free Trial</Link>
            </Button>
          </motion.span>

          <motion.span
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Button
              size="lg"
              variant="outline"
              className="h-16 px-12 text-xl font-black rounded-full bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10 transition-all"
              asChild
            >
              <Link href="#">Contact Sales</Link>
            </Button>
          </motion.span>
        </div>
      </div>
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--primary-foreground)_1.5px,_transparent_1.5px)] bg-[size:48px_48px]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />
    </section>
  );
}
