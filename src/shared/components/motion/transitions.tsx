import { motion } from "framer-motion";
import { type ReactNode } from "react";

type TransitionProps = Readonly<{
  children: ReactNode;
  className?: string;
}>;

// Slide and fade transition
export function SlideUpTransition({ children, className }: TransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Scale and rotate transition
export function ScaleRotateTransition({ children, className }: TransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
      transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Fade and expand transition
export function ExpandTransition({ children, className }: TransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger children animation
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
} as const;

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      bounce: 0.4,
    }
  },
} as const;

// Hover animations
export const hoverScale = {
  whileHover: { 
    scale: 1.01,
    y: -2,
    transition: { duration: 0.2 }
  },
  whileTap: { 
    scale: 0.99,
    y: 1,
  },
} as const;

// Subtle hover for images and badges
export const subtleHover = {
  whileHover: { 
    scale: 1.02,
    transition: { duration: 0.2 }
  },
} as const;

// Slide transition with direction
type SlideDirection = "left" | "right" | "up" | "down";
type SlideTransitionProps = Readonly<{
  children: ReactNode;
  direction?: SlideDirection;
  className?: string;
  duration?: number;
}>;

const slideVariants = {
  left: {
    enter: { x: -1000, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: 1000, opacity: 0 },
  },
  right: {
    enter: { x: 1000, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -1000, opacity: 0 },
  },
  up: {
    enter: { y: 1000, opacity: 0 },
    center: { y: 0, opacity: 1 },
    exit: { y: -1000, opacity: 0 },
  },
  down: {
    enter: { y: -1000, opacity: 0 },
    center: { y: 0, opacity: 1 },
    exit: { y: 1000, opacity: 0 },
  },
} as const;

export function SlideTransition({
  children,
  direction = "right",
  className,
  duration = 0.5,
}: SlideTransitionProps): JSX.Element {
  return (
    <motion.div
      variants={slideVariants[direction]}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        y: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: duration },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
