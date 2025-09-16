import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {/* Header with Sidebar Trigger */}
          <header className="h-14 flex items-center border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40">
            <SidebarTrigger className="ml-4" />
            <div className="flex-1 flex items-center justify-center">
              <h2 className="text-lg font-semibold text-foreground">ComplicesConecta</h2>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};