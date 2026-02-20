"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Avatar, Stack, Button, Icon, Divider, Badge } from "@/components/ui";
import type { Profile } from "@/types";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/admin", icon: <Icon name="menu" size="sm" /> },
  { id: "write", label: "New Post", href: "/admin/write", icon: <Icon name="plus" size="sm" /> },
  { id: "settings", label: "Settings", href: "/admin/settings", icon: <Icon name="settings" size="sm" /> },
];

interface AdminLayoutProps {
  profile: Profile | null;
  children: React.ReactNode;
}

export default function AdminLayout({ profile, children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 z-50 flex items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          <Icon name={sidebarOpen ? "close" : "menu"} size="md" />
        </Button>
        <span className="ml-3 font-bold text-zinc-900 dark:text-zinc-100">Admin Panel</span>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 
          flex flex-col z-40 transition-transform duration-300
          lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="p-6">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Icon name="settings" size="md" className="text-white" />
            </div>
            <div>
              <p className="font-bold text-zinc-900 dark:text-zinc-100">Admin</p>
              <p className="text-xs text-zinc-500">Dashboard</p>
            </div>
          </Link>
        </div>

        <Divider />

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3 px-2">
            Menu
          </p>
          <Stack gap="xs">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${
                    isActive(item.href)
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }
                `}
              >
                <span className={isActive(item.href) ? "text-white" : "text-zinc-400"}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </Stack>

          <Divider className="my-4" />

          <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3 px-2">
            Quick Actions
          </p>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
          >
            <Icon name="arrow-left" size="sm" className="text-zinc-400" />
            View Site
          </Link>
        </nav>

        {/* Profile Section */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <Avatar
              src={profile?.avatar_url || undefined}
              alt={profile?.username || "Admin"}
              className="w-10 h-10"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {profile?.username || "Admin"}
              </p>
              <p className="text-xs text-zinc-500 truncate">
                {profile?.bio || "Administrator"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
            leftIcon={<Icon name="close" size="sm" />}
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
