"use client";
import { motion } from "framer-motion";
import {
  Barcode,
  LineChart,
  Zap,
  Users,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fadeIn, staggerContainer } from "@/lib/motion-variants";

const features = [
  {
    icon: <Barcode className="h-6 w-6" />,
    title: "Barcode & SKU Scanning",
    description:
      "Add items instantly using any USB or Bluetooth scanner. Supports EAN, UPC, and custom SKUs.",
  },
  {
    icon: <LineChart className="h-6 w-6" />,
    title: "Real-Time Tracking",
    description:
      "Inventory updates automatically across all terminals. Never oversell or run out of stock again.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Fast Checkout",
    description:
      "Optimized for speed with keyboard shortcuts and a clean UI that keeps lines moving.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Customer Management",
    description:
      "Build loyalty with customer profiles, purchase history, and personalized discounts.",
  },
  {
    icon: <ShoppingBag className="h-6 w-6" />,
    title: "Supplier Portal",
    description:
      "Manage purchase orders, restock alerts, and supplier contact info in one place.",
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "Role-Based Security",
    description:
      "Granular permissions for owners, managers, and cashiers to protect your sensitive data.",
  },
];

export function Features() {
  return (
    <section
      id="feature"
      className="py-24 lg:py-32 bg-background relative overflow-hidden"
    >
      <motion.div
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="container relative z-10 px-6"
      >
        <div className="text-center max-w-3xl mx-auto mb-20 flex flex-col gap-6">
          <Badge
            variant="outline"
            className="w-fit mx-auto px-3 py-1 text-xs font-semibold uppercase tracking-wider border-primary text-black"
          >
            Features
          </Badge>
          <h2 className="text-4xl lg:text-6xl font-black tracking-tighter leading-none">
            Everything You Need <br />
            <span className="text-muted-foreground">to Run Your Store.</span>
          </h2>
          <p className="text-muted-foreground text-xl leading-relaxed">
            Powerful tools designed for real retail workflows. No fluff, just
            pure functionality to help you scale.
          </p>
        </div>
        <motion.div
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="group p-10 rounded-[2.5rem] bg-muted/20 border transition-all hover:bg-background hover:shadow-2xl hover:border-primary/20 hover:-translate-y-2"
            >
              <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 transform group-hover:rotate-6">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
      {/* Decorative dots */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-20 pointer-events-none -z-10">
        <div className="w-full h-full bg-[radial-gradient(circle,_var(--primary)_1px,_transparent_1px)] bg-[size:24px_24px]" />
      </div>
    </section>
  );
}
