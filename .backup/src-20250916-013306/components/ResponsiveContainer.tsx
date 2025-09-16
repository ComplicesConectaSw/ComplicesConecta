import { ReactNode } from 'react';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

export const ResponsiveContainer = ({ children, className = '' }: ResponsiveContainerProps) => {
  return (
    <div className={`
      w-full 
      max-w-full 
      overflow-x-hidden 
      px-4 
      sm:px-6 
      lg:px-8 
      mx-auto
      ${className}
    `}>
      <div className="
        w-full 
        max-w-7xl 
        mx-auto
        min-h-0
      ">
        {children}
      </div>
    </div>
  );
};
