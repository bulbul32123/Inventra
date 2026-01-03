"use client";

import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/motion-variants";
import { Badge } from "@/components/ui/badge";
import { Store, Utensils, Pill, Laptop, Building2 } from "lucide-react";

const useCases = [
  {
    title: "Retail Stores",
    description:
      "Perfect for boutiques, gift shops, and general retail. Manage thousands of SKUs and variants with ease.",
    icon: <Store className="h-6 w-6" />,
    features: ["SKU Variants", "Label Printing", "Stock Alerts"],
  },
  {
    title: "Super Shops",
    description:
      "Designed for high-volume grocery and convenience stores. Fast scanning and efficient checkout flow.",
    icon: <Building2 className="h-6 w-6" />,
    features: ["Barcode Bulk Scanning", "Supplier Management", "Daily Reports"],
  },
  {
    title: "Restaurants",
    description:
      "Streamline your food business. Manage ingredients as inventory and track your cost of goods sold.",
    icon: <Utensils className="h-6 w-6" />,
    features: ["Ingredient Tracking", "Kitchen Receipts", "Order History"],
  },
  {
    title: "Pharmacies",
    description:
      "Handle sensitive products with batch tracking, expiry dates, and regulatory compliance features.",
    icon: <Pill className="h-6 w-6" />,
    features: ["Expiry Alerts", "Batch Tracking", "Customer History"],
  },
  {
    title: "Multi-branch",
    description:
      "Scale your business. Sync inventory across multiple locations and manage everything from one head office.",
    icon: <Laptop className="h-6 w-6" />,
    features: ["Inter-branch Transfer", "Centralized Analytics", "User Roles"],
  },
];

export function UseCases() {
  return (
    <section id="use-cases" className="py-24 lg:py-32">
      <div className="container">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:sticky lg:top-32 max-w-xl flex flex-col gap-6 px-4"
          >
            <Badge
              variant="outline"
              className="w-fit px-3 py-1 text-xs font-semibold uppercase tracking-wider border-primary text-black"
            >
              Built For You
            </Badge>
            <h2 className="text-4xl lg:text-6xl font-black tracking-tight leading-none">
              One Solution, <br />
              <span className="text-muted-foreground">
                Unlimited Scenarios.
              </span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We've built Inventra to be flexible enough for any retail
              environment while remaining incredibly simple to use.
            </p>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex-1 grid sm:grid-cols-2 gap-4"
          >
            {useCases.map((useCase, i) => (
              <motion.div
                variants={fadeIn}
                whileHover={{ scale: 1.02 }}
                key={i}
                className={`p-8 rounded-3xl border transition-all hover:shadow-xl ${
                  i === 0
                    ? "sm:col-span-2 bg-primary text-primary-foreground border-primary shadow-2xl shadow-primary/20"
                    : "bg-background hover:-translate-y-1"
                }`}
              >
                <div
                  className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${
                    i === 0
                      ? "bg-primary-foreground text-primary"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {useCase.icon}
                </div>
                <h3 className="text-2xl font-black mb-3 leading-tight">
                  {useCase.title}
                </h3>
                <p
                  className={`mb-6 leading-relaxed ${
                    i === 0
                      ? "text-primary-foreground/90"
                      : "text-muted-foreground"
                  }`}
                >
                  {useCase.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {useCase.features.map((feature, j) => (
                    <span
                      key={j}
                      className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${
                        i === 0
                          ? "bg-primary-foreground/10 border-primary-foreground/20"
                          : "bg-muted/50"
                      }`}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
