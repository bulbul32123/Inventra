"use client"

import { motion } from "framer-motion"
import { fadeIn, staggerContainer } from "@/lib/motion-variants"
import { Badge } from "@/components/ui/badge"
import { Quote } from "lucide-react"

const testimonials = [
  {
    quote:
      "Inventra has completely transformed how we manage our inventory. The scanning speed is incredible, and our checkout times have dropped by 40%.",
    author: "James Chen",
    role: "Owner, Green Market Grocers",
  },
  {
    quote:
      "Finally, a POS that doesn't require a PhD to set up. My staff learned the entire system in under an hour. Best business decision this year.",
    author: "Sarah Thompson",
    role: "Manager, The Daily Grind Coffee",
  },
  {
    quote:
      "The multi-branch syncing is a lifesaver. I can track sales across all 3 of my pharmacies from my phone while I'm at home.",
    author: "Dr. Amara Okoro",
    role: "Director, LifeCare Pharmacy Group",
  },
]

export function Testimonials() {
  return (
    <section className="py-24 lg:py-32 overflow-hidden">
      <motion.div   variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }} className="container">
        <motion.div variants={fadeIn} className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-4 px-4">
          <Badge
            variant="outline"
            className="w-fit mx-auto px-3 py-1 text-xs font-semibold uppercase tracking-wider border-primary text-black"
          >
            Testimonials
          </Badge>
          <h2 className="text-3xl font-black tracking-tight sm:text-5xl">Loved by Business Owners</h2>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div   variants={fadeIn}
            whileHover={{ scale: 1.05 }}
              key={i}
              className="p-10 rounded-[2rem] bg-muted/20 border flex flex-col gap-6 relative group hover:bg-background transition-colors"
            >
              <Quote className="h-10 w-10 text-primary opacity-20 absolute top-10 right-10 group-hover:opacity-40 transition-opacity" />
              <p className="text-xl font-medium leading-relaxed italic relative z-10">"{t.quote}"</p>
              <div className="mt-auto flex flex-col">
                <span className="font-black text-lg">{t.author}</span>
                <span className="text-sm text-muted-foreground font-medium uppercase tracking-widest">{t.role}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
