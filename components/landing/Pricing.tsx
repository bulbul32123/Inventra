"use client";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/motion-variants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "$0",
    description: "Perfect for small shops just starting out.",
    features: [
      { name: "Up to 10 Products", available: true },
      { name: "10 Transactions / month", available: true },
      { name: "Basic Inventory Logs", available: true },
      { name: "1 Terminal", available: true },
      { name: "Barcode Scanning", available: true },
      { name: "Advanced Reports", available: false },
      { name: "Priority Support", available: false },
    ],
    buttonText: "Start for Free",
    buttonVariant: "outline" as const,
  },
  {
    name: "Pro",
    price: "$29",
    description: "Everything you need to scale your business.",
    features: [
      { name: "Unlimited Products", available: true },
      { name: "Unlimited Transactions", available: true },
      { name: "Advanced Inventory Logs", available: true },
      { name: "Up to 5 Terminals", available: true },
      { name: "Barcode & SKU Scanning", available: true },
      { name: "Full Reports & Analytics", available: true },
      { name: "Priority 24/7 Support", available: true },
    ],
    popular: true,
    buttonText: "Go Pro Now",
    buttonVariant: "default" as const,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="container"
      >
        <motion.div variants={fadeIn} className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-4 px-4">
          <Badge
            variant="outline"
            className="w-fit mx-auto px-3 py-1 text-xs font-semibold uppercase tracking-wider border-primary text-black"
          >
            Pricing
          </Badge>
          <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground text-lg">
            No hidden fees. Choose the plan that fits your business needs.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              variants={fadeIn}
              whileHover={{ y: -10 }}
              className={`relative p-8 lg:p-12 rounded-[2.5rem] bg-background border transition-all hover:shadow-2xl flex flex-col ${
                plan.popular
                  ? "border-primary ring-4 ring-primary/10 shadow-xl"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-12 transform -translate-y-1/2">
                  <Badge className="bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border-4 border-background">
                    Most Popular
                  </Badge>
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-5xl font-black tracking-tighter">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground font-medium">
                    /month
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="flex-1 flex flex-col gap-4 mb-10">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div
                      className={`h-5 w-5 rounded-full flex items-center justify-center border-2 ${
                        feature.available
                          ? "border-primary text-primary"
                          : "border-muted text-muted-foreground"
                      }`}
                    >
                      {feature.available ? (
                        <Check className="h-3 w-3" strokeWidth={3} />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        feature.available
                          ? "text-foreground"
                          : "text-muted-foreground line-through"
                      }`}
                    >
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                variant={plan.buttonVariant}
                className={`w-full h-14 rounded-full text-lg font-black transition-transform active:scale-95 ${
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : ""
                }`}
                asChild
              >
                <Link href="/register">{plan.buttonText}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
