import { Sidebar, SidebarContent, useSidebar } from '@/components/ui/sidebar';
import { mainNavItems, premiumItems, settingsItems, mockUser } from '@/lib/data';
import { UserProfile } from '@/profiles/shared/UserProfile';
import { CollapsedUserProfile } from '@/profiles/shared/CollapsedUserProfile';
import { NavGroup } from '@/components/sidebar/NavGroup';
import { QuickActions } from '@/components/sidebar/QuickActions';

export function AppSidebar() {
  const { state } = useSidebar();

  const isCollapsed = state === 'collapsed';

  // La función para determinar la clase de navegación activa se mantiene aquí
  // ya que es utilizada por todos los grupos de navegación.
  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary'
      : 'hover:bg-muted/50';

  return (
    <Sidebar className={isCollapsed ? 'w-16' : 'w-72'}>
      <SidebarContent className="bg-card">
        {isCollapsed ? (
          <CollapsedUserProfile user={mockUser} />
        ) : (
          <UserProfile user={mockUser} />
        )}

        <NavGroup
          label="Principal"
          items={mainNavItems}
          isCollapsed={isCollapsed}
          getNavClass={getNavClass}
        />

        <NavGroup
          label="Premium"
          items={premiumItems}
          isCollapsed={isCollapsed}
          getNavClass={getNavClass}
        />

        <NavGroup
          label="Configuración"
          items={settingsItems}
          isCollapsed={isCollapsed}
          getNavClass={getNavClass}
        />

        {!isCollapsed && <QuickActions />}
      </SidebarContent>
    </Sidebar>
  );
}