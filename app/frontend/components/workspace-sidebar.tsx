import {
  Sidebar,
  SidebarContent,
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

export default function WorkspaceSidebar() {
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
    </Sidebar>
  );
}
