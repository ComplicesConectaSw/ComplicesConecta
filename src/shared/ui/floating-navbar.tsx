import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { cn } from "@/shared/lib/cn";

export interface FloatingNavItem {
  name: string;
  link: string;
  icon?: JSX.Element;
}

interface FloatingNavProps {
  navItems: FloatingNavItem[];
  className?: string;
}

export const FloatingNav = ({ navItems, className }: FloatingNavProps) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(true);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current === "number") {
      const previous = scrollYProgress.getPrevious() ?? 0;
      const direction = current - previous;

      if (scrollYProgress.get() < 0.05) {
        setVisible(true);
      } else {
        setVisible(direction < 0);
      }
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 1, y: -100 }}
        animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "flex max-w-fit fixed top-4 inset-x-0 mx-auto rounded-full bg-black/80 border border-white/10 backdrop-blur-md shadow-[0px_2px_10px_rgba(0,0,0,0.5)] z-[100] pr-3 pl-6 py-2 items-center justify-center space-x-4",
          className,
        )}
      >
        {navItems.map((navItem, idx) => (
          <Link
            key={`floating-link-${idx}`}
            to={navItem.link}
            className={cn(
              "relative items-center flex space-x-1 text-neutral-200 hover:text-purple-300 transition-colors px-2 py-1",
            )}
          >
            {navItem.icon && (
              <span className="block sm:hidden text-lg">
                {navItem.icon}
              </span>
            )}
            <span className="hidden sm:block text-sm font-medium">
              {navItem.name}
            </span>
          </Link>
        ))}

        <Link to="/auth" className="ml-2">
          <button className="relative border text-sm font-medium border-purple-500/70 text-white px-4 py-1.5 rounded-full hover:bg-purple-600/20 transition-colors overflow-hidden">
            <span>Iniciar Sesión</span>
            <span className="pointer-events-none absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-purple-500 to-transparent h-px" />
          </button>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
};
