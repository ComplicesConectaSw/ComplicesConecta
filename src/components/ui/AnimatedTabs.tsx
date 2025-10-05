import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
  badge?: number;
}

interface AnimatedTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  variant?: "default" | "pills" | "underline" | "cards";
  size?: "sm" | "md" | "lg";
  orientation?: "horizontal" | "vertical";
  className?: string;
  onTabChange?: (tabId: string) => void;
}

const tabVariants = {
  default: {
    active: "bg-primary text-primary-foreground shadow-sm",
    inactive: "text-muted-foreground hover:text-foreground hover:bg-muted/50"
  },
  pills: {
    active: "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg",
    inactive: "text-muted-foreground hover:text-foreground hover:bg-muted/50"
  },
  underline: {
    active: "text-primary border-b-2 border-primary",
    inactive: "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
  },
  cards: {
    active: "bg-card text-card-foreground shadow-md border-primary/20",
    inactive: "text-muted-foreground hover:text-foreground hover:bg-muted/30 border-transparent"
  }
};

const sizeVariants = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base"
};

export const AnimatedTabs = ({
  tabs,
  defaultTab,
  variant = "default",
  size = "md",
  orientation = "horizontal",
  className,
  onTabChange
}: AnimatedTabsProps) => {
  const [activeTab, setActiveTab] = React.useState(defaultTab || tabs[0]?.id);

  const handleTabClick = React.useCallback((tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab?.disabled) return;
    
    setActiveTab(tabId);
    onTabChange?.(tabId);
  }, [tabs, onTabChange]);

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={cn(
      "w-full",
      orientation === "vertical" && "flex gap-4",
      className
    )}>
      {/* Tab List */}
      <div className={cn(
        "relative",
        orientation === "horizontal" 
          ? "flex space-x-1 border-b border-border/40" 
          : "flex flex-col space-y-1 min-w-[200px]"
      )}>
        {/* Background Indicator */}
        <motion.div
          className={cn(
            "absolute rounded-md pointer-events-none",
            variant === "pills" && "bg-gradient-to-r from-purple-500/20 to-pink-500/20",
            variant === "cards" && "bg-muted border",
            variant === "default" && "bg-muted",
            variant === "underline" && "hidden"
          )}
          layoutId="activeTab"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />

        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              disabled={tab.disabled}
              className={cn(
                "relative px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 whitespace-nowrap flex-shrink-0",
                "hover:bg-white/10 cursor-pointer flex items-center gap-1 sm:gap-2 touch-manipulation",
                activeTab === tab.id
                  ? "text-white bg-white/20"
                  : "text-white/70 hover:text-white",
                orientation === "vertical" && "justify-start w-full"
              )}
              whileHover={!tab.disabled ? { scale: 1.02 } : {}}
              whileTap={!tab.disabled ? { scale: 0.98 } : {}}
            >
              {/* Icon */}
              {tab.icon && (
                <motion.div
                  animate={isActive ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {tab.icon}
                </motion.div>
              )}

              {/* Label */}
              <span>{tab.label}</span>

              {/* Badge */}
              {tab.badge !== undefined && tab.badge > 0 && (
                <motion.span
                  className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {tab.badge > 99 ? '99+' : tab.badge}
                </motion.span>
              )}

              {/* Underline Indicator */}
              {variant === "underline" && isActive && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary pointer-events-none"
                  layoutId="underline"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {activeTabContent}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnimatedTabs;
