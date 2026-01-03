"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/motion-variants";

const faqs = [
  {
    question: "Do I need special hardware to use Inventra?",
    answer:
      "No. Inventra works in any modern web browser. You can use any USB or Bluetooth barcode scanner, and standard thermal receipt printers are supported.",
  },
  {
    question: "Can I use it offline?",
    answer:
      "Currently, Inventra requires an active internet connection to ensure your inventory is synced across all devices in real-time. We are working on an offline-first mobile app.",
  },
  {
    question: "How secure is my data?",
    answer:
      "We use enterprise-grade encryption for all data storage and transmission. Your database is isolated, and we never share your business data with third parties.",
  },
  {
    question: "Can I import my existing product list?",
    answer:
      "Yes! You can easily import products via CSV or Excel files. Our bulk import tool handles thousands of items at once.",
  },
  {
    question: "Is there a limit to the number of users?",
    answer:
      "The Starter plan is limited to 1 terminal, but the Pro plan supports up to 5 terminals and unlimited staff accounts with role-based permissions.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 lg:py-32 bg-muted/30">
      <div className="container max-w-4xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="text-center mb-16 flex flex-col gap-4"
        >
          <Badge
            variant="outline"
            className="w-fit mx-auto px-3 py-1 text-xs font-semibold uppercase tracking-wider border-primary text-black"
          >
            FAQ
          </Badge>
          <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
            Common Questions
          </h2>
        </motion.div>
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className=""
        >
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-background border rounded-2xl px-6 py-2 overflow-hidden hover:border-primary transition-colors"
              >
                <AccordionTrigger className="text-left font-black text-lg hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
