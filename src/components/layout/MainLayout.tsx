"use client";

import { useState } from "react";
import ProfileSidebar from "./ProfileSidebar";
import { Button, Icon } from "@/components/ui";
import type { Profile } from "@/types";

interface MainLayoutProps {
  profile: Profile | null;
  children: React.ReactNode;
}

export default function MainLayout({ profile, children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Mobile Header - 사이드바 열리면 숨김 */}
      {!sidebarOpen && (
        <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 z-50 flex items-center px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Icon name="menu" size="md" />
          </Button>
          <span className="ml-3 font-bold text-zinc-900 dark:text-zinc-100">
            {profile?.username || "Portfolio"}
          </span>
        </header>
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed left-0 top-0 h-screen z-40
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <ProfileSidebar 
          profile={profile} 
          onNavigate={() => setSidebarOpen(false)}
          onClose={() => setSidebarOpen(false)}
          showCloseButton={sidebarOpen}
        />
      </div>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
