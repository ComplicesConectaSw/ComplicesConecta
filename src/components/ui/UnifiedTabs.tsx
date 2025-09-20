import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface UnifiedTabsProps {
  items: TabItem[];
  defaultValue?: string;
  className?: string;
  listClassName?: string;
  contentClassName?: string;
  animated?: boolean;
  variant?: 'default' | 'pills' | 'underline';
}

export const UnifiedTabs: React.FC<UnifiedTabsProps> = ({
  items,
  defaultValue,
  className,
  listClassName,
  contentClassName,
  animated = true,
  variant = 'default'
}) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue || items[0]?.value);

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className={cn("w-full", className)}
    >
      <TabsList
        className={cn(
          "grid w-full",
          variant === 'pills' && "bg-gray-100 p-1 rounded-lg",
          variant === 'underline' && "bg-transparent border-b border-gray-200 rounded-none",
          listClassName
        )}
        style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}
      >
        {items.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={cn(
              "relative flex items-center gap-2 transition-all duration-200",
              variant === 'pills' && [
                "rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm",
                "hover:bg-white/50"
              ],
              variant === 'underline' && [
                "border-b-2 border-transparent data-[state=active]:border-pink-500",
                "rounded-none bg-transparent hover:bg-gray-50"
              ]
            )}
          >
            {item.icon}
            <span>{item.label}</span>
            
            {/* Indicador activo animado */}
            {animated && activeTab === item.value && variant === 'default' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white rounded-md shadow-sm -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      {items.map((item) => (
        <TabsContent
          key={item.value}
          value={item.value}
          className={cn("mt-4", contentClassName)}
        >
          {animated ? (
            <motion.div
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {item.content}
            </motion.div>
          ) : (
            item.content
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};
