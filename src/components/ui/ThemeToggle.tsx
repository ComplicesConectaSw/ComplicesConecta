import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { useTheme } from '@/components/ui/ThemeProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="btn-animated hover:scale-105 active:scale-95 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        className="bg-gradient-to-r from-pink-500/95 to-purple-600/95 dark:bg-gray-900/95 backdrop-blur-sm border-pink-400/50 dark:border-gray-700/50 shadow-xl"
      >
        <DropdownMenuItem 
          onClick={() => {
            setTheme('light');
            // Forzar actualización inmediata
            const root = document.documentElement;
            root.classList.remove('dark');
            root.classList.add('light');
          }}
          className="cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors text-foreground"
        >
          <Sun className="mr-2 h-4 w-4 text-yellow-500" />
          <span className="font-medium drop-shadow-sm">Claro</span>
          {theme === 'light' && <span className="ml-auto text-purple-600 dark:text-purple-400 font-bold">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => {
            setTheme('dark');
            // Forzar actualización inmediata
            const root = document.documentElement;
            root.classList.remove('light');
            root.classList.add('dark');
          }}
          className="cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors text-foreground"
        >
          <Moon className="mr-2 h-4 w-4 text-blue-400" />
          <span className="font-medium drop-shadow-sm">Oscuro</span>
          {theme === 'dark' && <span className="ml-auto text-purple-600 dark:text-purple-400 font-bold">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => {
            setTheme('system');
            // Aplicar tema del sistema inmediatamente
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const root = document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(prefersDark ? 'dark' : 'light');
          }}
          className="cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors text-foreground"
        >
          <Monitor className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="font-medium drop-shadow-sm">Sistema</span>
          {theme === 'system' && <span className="ml-auto text-purple-600 dark:text-purple-400 font-bold">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
