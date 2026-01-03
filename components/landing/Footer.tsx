"use client";
import { fadeIn } from "@/lib/motion-variants";
import { motion } from "framer-motion";
import { Package2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t py-12 bg-background px-5">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 lg:col-span-2">
            <motion.div
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex items-center gap-2 mb-4"
            >
              <Image
                src={"/logo.svg"}
                alt="Logo"
                className="w-8 h-8 rounded-md"
                width={8}
                height={8}
              />
              <span className="text-xl font-bold tracking-tight">Inventra</span>
            </motion.div>
            <motion.p
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-muted-foreground max-w-[280px]"
            >
              The simple, fast, and reliable POS system for modern retail stores
              and minimarts.
            </motion.p>
          </div>
          <div>
            <motion.h4
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="font-bold mb-4"
            >
              Product
            </motion.h4>
            <motion.ul
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-2 text-sm text-muted-foreground"
            >
              <li>
                <Link href="#features">Features</Link>
              </li>
              <li>
                <Link href="#how-it-works">How it Works</Link>
              </li>
              <li>
                <Link href="#pricing">Pricing</Link>
              </li>
              <li>
                <Link href="/login">Demo</Link>
              </li>
            </motion.ul>
          </div>
          <div>
            <motion.h4
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="font-bold mb-4"
            >
              Support
            </motion.h4>
            <motion.ul
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-2 text-sm text-muted-foreground"
            >
              <li>
                <Link href="#">Help Center</Link>
              </li>
              <li>
                <Link href="#">Contact Sales</Link>
              </li>
              <li>
                <Link href="#">API Docs</Link>
              </li>
              <li>
                <Link href="#">System Status</Link>
              </li>
            </motion.ul>
          </div>
          <div>
            <motion.h4
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="font-bold mb-4"
            >
              Legal
            </motion.h4>
            <motion.ul
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-2 text-sm text-muted-foreground"
            >
              <li>
                <Link href="#">Privacy Policy</Link>
              </li>
              <li>
                <Link href="#">Terms of Service</Link>
              </li>
              <li>
                <Link href="#">Cookie Policy</Link>
              </li>
            </motion.ul>
          </div>
        </div>
        <div className="pt-8 border-t flex flex-col md:flex-row justify-between gap-4 text-xs text-muted-foreground uppercase tracking-widest">
          <motion.p
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            whileInView="visible"
            transition={{ duration: 0.8 }}
          >
            © {new Date().getFullYear()} Inventra POS. All rights reserved.
          </motion.p>
          <motion.div className="flex gap-6">
            <motion.span
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              whileInView="visible"
              transition={{ duration: 1 }}
            >
              <Link
                href="https://x.com/BulbulIslam369"
                className="hover:text-black transition-colors"
              >
                Twitter
              </Link>
            </motion.span>
            <motion.span
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              whileInView="visible"
              transition={{ duration: 1.4 }}
            >
              <Link
                href="https://www.linkedin.com/in/bulbulwebdev/"
                className="hover:text-black transition-colors"
              >
                LinkedIn
              </Link>
            </motion.span>
            <motion.span
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              whileInView="visible"
              transition={{ duration: 1.6 }}
            >
              <Link
                href="https://github.com/bulbul32123"
                className="hover:text-black transition-colors"
              >
                Github
              </Link>
            </motion.span>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
