import { motion } from "framer-motion";
import { type ReactNode } from "react";

type PageTransitionProps = Readonly<{
  children: ReactNode;
}>;

const pageVariants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: 20,
  },
} as const;

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5,
} as const;

export function PageTransition({ children }: PageTransitionProps): JSX.Element {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
