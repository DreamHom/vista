"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SIGNUP_SUCCESS_STEPS } from "./auth-shared";

export function SignupSuccessPanel({ next }: { next?: string }) {
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  return (
    <div className="space-y-8">
      <div className="space-y-3 text-center sm:text-left">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
        >
          You&apos;re in.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="text-sm leading-relaxed text-muted-foreground md:text-base"
        >
          Welcome to DreamHomes. Use the email and password you just chose to sign in and pick up in your dashboard.
        </motion.p>
      </div>

      <ul className="space-y-4" aria-label="What is ready">
        {SIGNUP_SUCCESS_STEPS.map((line, index) => (
          <motion.li
            key={line}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.12 + index * 0.1,
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex items-start gap-3 text-sm leading-snug text-foreground md:text-[0.9375rem]"
          >
            <motion.span
              initial={{ scale: 0, rotate: -35 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.18 + index * 0.1,
                type: "spring",
                stiffness: 520,
                damping: 22,
              }}
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-primary/10 text-primary shadow-sm"
              aria-hidden
            >
              <Check className="h-[1.125rem] w-[1.125rem] stroke-[2.5]" strokeLinecap="round" strokeLinejoin="round" />
            </motion.span>
            <span className="pt-1.5">{line}</span>
          </motion.li>
        ))}
      </ul>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-wrap gap-3"
      >
        <Link href={loginHref} className={cn(buttonVariants({ variant: "primary", size: "lg" }), "rounded-none")}>
          Sign in to DreamHomes
        </Link>
        <Link href="/listings" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-none")}>
          Browse listings
        </Link>
      </motion.div>
    </div>
  );
}
