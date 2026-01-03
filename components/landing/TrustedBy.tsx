"use client";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/motion-variants";

export default function TrustedBy() {
  return (
    <section className="py-12 border-y bg-muted/10">
      <div className="container overflow-hidden">
        <motion.h2
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 mb-8"
        >
          Trusted by Businesses Worldwide
        </motion.h2>
        <div className="flex flex-wrap justify-center gap-10 md:gap-20 ">
          {["Grocery", "Minimarts", "Retail", "Pharmacy", "Restaurants"].map(
            (store, i) => (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                whileInView="visible"
                transition={{ duration: 0.8 * i }}
                key={store}
                className="text-2xl font-black tracking-tighter flex items-center gap-3"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {store}
              </motion.div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
