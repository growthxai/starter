import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { root_path } from '@/rails/routes';
import { Link, usePage } from '@inertiajs/react';
import { Home } from 'lucide-react';

interface User {
  name: string;
  email: string;
}

interface WorkspaceSidebarProps {
  currentUser?: User;
}

export default function WorkspaceSidebar({ currentUser }: WorkspaceSidebarProps) {
  const { currentPath } = usePage<{ currentPath: string }>().props;

  const menuItems = [
    {
      title: 'Home',
      url: root_path(),
      icon: Home,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="h-14 justify-center border-b px-4">
        <Link href={root_path()} className="flex items-center gap-2 font-semibold">
          <span className="text-lg">Starter</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={currentPath === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {currentUser && (
        <SidebarFooter className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
              {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col text-sm">
              <span className="font-medium">{currentUser.name}</span>
              <span className="text-muted-foreground text-xs">{currentUser.email}</span>
            </div>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
