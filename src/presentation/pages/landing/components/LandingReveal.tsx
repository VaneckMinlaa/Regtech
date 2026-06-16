import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import {
  cardItem,
  fadeUp,
  landingTransition,
  staggerContainer,
  staggerFast,
} from "@/presentation/pages/landing/motion/landingMotion";

interface LandingRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Above-the-fold: animate on mount instead of scroll. */
  immediate?: boolean;
}

export function LandingReveal({
  children,
  className = "",
  delay = 0,
  immediate = false,
}: LandingRevealProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      {...(immediate
        ? { animate: "visible" }
        : { whileInView: "visible", viewport: { once: true, margin: "-72px" } })}
      variants={fadeUp}
      transition={landingTransition(0.6, delay)}
    >
      {children}
    </motion.div>
  );
}

export function LandingStagger({
  children,
  className = "",
  immediate = false,
  fast = false,
}: {
  children: ReactNode;
  className?: string;
  immediate?: boolean;
  fast?: boolean;
}) {
  const variants: Variants = fast ? staggerFast : staggerContainer;
  return (
    <motion.div
      className={className}
      initial="hidden"
      {...(immediate
        ? { animate: "visible" }
        : { whileInView: "visible", viewport: { once: true, margin: "-64px" } })}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

export function LandingStaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={cardItem}
      transition={landingTransition(0.5)}
    >
      {children}
    </motion.div>
  );
}
