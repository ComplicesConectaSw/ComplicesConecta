import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { ChevronDown, LogIn } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export interface FloatingNavItem {
  name: string;
  link?: string;
  icon?: JSX.Element;
  children?: FloatingNavItem[];
}

interface FloatingNavProps {
  navItems: FloatingNavItem[];
  className?: string;
}

export const FloatingNav = ({ navItems, className }: FloatingNavProps) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(true);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

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
          "fixed top-4 left-0 right-0 mx-auto w-[95%] z-[5000] pt-[env(safe-area-inset-top)]",
          "flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl",
          "sm:w-fit sm:px-8 sm:py-2 sm:rounded-full",
          className,
        )}
      >
        <div className="flex items-center justify-between w-full sm:w-auto sm:gap-4">
          {navItems.map((navItem, idx) => {
            if (navItem.children && navItem.children.length > 0) {
              return (
                <div key={`link=${idx}`} className="relative flex items-center justify-center">
                  <button
                    onClick={() => setIsMoreOpen((prev) => !prev)}
                    className="flex items-center gap-2 text-neutral-300 hover:text-purple-400 transition-colors p-2"
                  >
                    <span className="block text-xl sm:text-base">{navItem.icon}</span>
                    <span className="hidden sm:block text-sm font-medium">{navItem.name}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isMoreOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isMoreOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full mt-4 -left-1/2 w-48 bg-black/90 border border-white/10 rounded-xl overflow-hidden shadow-xl backdrop-blur-xl flex flex-col p-2 gap-1"
                      >
                        {navItem.children.map((child, childIdx) => (
                          <Link
                            key={`child=${childIdx}`}
                            to={child.link!}
                            onClick={() => setIsMoreOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          >
                            {child.icon}
                            <span>{child.name}</span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <Link
                key={`link=${idx}`}
                to={navItem.link!}
                className="flex items-center gap-2 text-neutral-300 hover:text-purple-400 transition-colors p-2"
              >
                <span className="block text-xl sm:text-base">{navItem.icon}</span>
                <span className="hidden sm:block text-sm font-medium">{navItem.name}</span>
              </Link>
            );
          })}

          <Link to="/auth" className="ml-2">
            <button
              className="relative border border-purple-500/50 text-white rounded-full hover:bg-purple-500/20 transition-colors group h-10 w-10 flex items-center justify-center sm:w-auto sm:h-auto sm:px-4 sm:py-2 text-sm font-medium"
            >
              <LogIn className="w-5 h-5 sm:hidden" />
              <span className="hidden sm:inline">Ingresar</span>
              <span className="hidden sm:block absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-purple-500 to-transparent h-px" />
            </button>
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
