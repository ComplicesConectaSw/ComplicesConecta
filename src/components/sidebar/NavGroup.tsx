import { NavLink } from 'react-router-dom';
import { 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  Badge
} from '@/imports';

// Tipos para los items de navegación
interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavGroupProps {
  label: string;
  items: NavItem[];
  isCollapsed: boolean;
  getNavClass: ({ isActive }: { isActive: boolean }) => string;
}

export const NavGroup = ({ label, items, isCollapsed, getNavClass }: NavGroupProps) => (
  <SidebarGroup>
    <SidebarGroupLabel>{label}</SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
                {(items ?? []).map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild>
              <NavLink to={item.url} className={getNavClass}>
                <item.icon className="h-5 w-5" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <Badge 
                        variant={item.badge === 'Nuevo' ? 'secondary' : 'destructive'} 
                        className="text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
);
