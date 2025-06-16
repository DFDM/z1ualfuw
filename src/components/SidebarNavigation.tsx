
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { LayoutDashboard, Settings, LogOut, Users } from 'lucide-react'; 
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/users', label: 'Users', icon: Users }, 
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function SidebarNavigation() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <>
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                tooltip={{ children: item.label, className:"bg-primary text-primary-foreground" }}
              >
                <a> 
                  <item.icon />
                  <span>{item.label}</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarMenu className="mt-auto">
        <SidebarMenuItem>
          <SidebarMenuButton onClick={logout} tooltip={{ children: 'Log Out', className:"bg-primary text-primary-foreground" }}>
            <LogOut />
            <span>Log Out</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}

