"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, Stack, Icon } from "@/components/ui";
import type { Profile } from "@/types";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  { id: "all", label: "All Boards", href: "/", icon: <Icon name="menu" size="sm" /> },
  { id: "works", label: "Works", href: "/works", icon: <Icon name="bookmark" size="sm" /> },
  { id: "food", label: "Food", href: "/life?category=food", icon: <Icon name="heart" size="sm" /> },
  { id: "drawing", label: "Drawing", href: "/life?category=drawing", icon: <Icon name="plus" size="sm" /> },
];

interface ProfileSidebarProps {
  profile: Profile | null;
  onNavigate?: () => void;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export default function ProfileSidebar({ profile, onNavigate, onClose, showCloseButton }: ProfileSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href.split("?")[0]);
  };

  return (
    <aside className="h-screen w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col relative">
      {/* Close Button - 모바일에서만 표시 */}
      {showCloseButton && (
        <button
          onClick={onClose}
          className="lg:hidden absolute top-3 right-3 w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors z-10"
          aria-label="Close menu"
        >
          <Icon name="close" size="sm" />
        </button>
      )}

      {/* Profile Section */}
      <div className="p-6 text-center">
        <div className="relative inline-block mb-4">
          <Avatar
            src={profile?.avatar_url || undefined}
            alt={profile?.username || "Profile"}
            className="w-24 h-24 ring-4 ring-blue-100 dark:ring-blue-900/30"
          />
          <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-zinc-900" />
        </div>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {profile?.username || "Portfolio"}
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
          {profile?.bio || "Digital Creator & Developer"}
        </p>

        {/* Social Icons */}
        <Stack direction="row" gap="sm" justify="center" className="mt-4">
          <button className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
            <Icon name="share" size="sm" />
          </button>
          <button className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            <Icon name="chat" size="sm" />
          </button>
          <button className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            <Icon name="bookmark" size="sm" />
          </button>
        </Stack>
      </div>

      <hr className="mx-4 border-zinc-200 dark:border-zinc-700" />

      {/* Navigation Menu */}
      <div className="flex-1 p-4 overflow-y-auto">
        <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3 px-2">
          Curated Boards
        </p>
        <Stack gap="xs">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={onNavigate}
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
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <p className="text-xs text-zinc-400 text-center">
          © 2024 {profile?.username || "Portfolio"}
        </p>
      </div>
    </aside>
  );
}
