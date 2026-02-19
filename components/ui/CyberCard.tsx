"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  glow?: string;
  className?: string;
}

export function CyberCard({ children, className = "", ...props }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`bg-surface rounded-xl border border-border shadow-sm ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
