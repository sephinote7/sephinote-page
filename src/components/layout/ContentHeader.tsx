"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Stack, Input, Icon } from "@/components/ui";

interface Tab {
  id: string;
  label: string;
  href: string;
}

const tabs: Tab[] = [
  { id: "latest", label: "Latest Posts", href: "/" },
  { id: "popular", label: "Popular", href: "/?sort=popular" },
  { id: "works", label: "Works", href: "/works" },
  { id: "food", label: "Food", href: "/life?category=food" },
  { id: "drawing", label: "Drawing", href: "/life?category=drawing" },
];

interface ContentHeaderProps {
  showTabs?: boolean;
  showSearch?: boolean;
}

export default function ContentHeader({ showTabs = true, showSearch = true }: ContentHeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  const isActive = (tab: Tab) => {
    if (tab.href === "/") {
      return pathname === "/" && !searchParams.get("sort") && !searchParams.get("q");
    }
    if (tab.href.includes("?")) {
      const [path, query] = tab.href.split("?");
      const params = new URLSearchParams(query);
      if (pathname === path || pathname.startsWith(path)) {
        for (const [key, value] of params.entries()) {
          if (searchParams.get(key) === value) return true;
        }
      }
      return false;
    }
    return pathname === tab.href || pathname.startsWith(tab.href);
  };

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  }, [searchQuery, router]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(e as unknown as React.FormEvent);
    }
  }, [handleSearch]);

  return (
    <div className="sticky top-14 lg:top-0 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md z-20 border-b border-zinc-200 dark:border-zinc-800">
      <div className="px-6 lg:px-8 py-4">
        <Stack direction="row" justify="between" align="center" gap="md" wrap>
          {/* Tabs */}
          {showTabs && (
            <Stack direction="row" gap="xs" className="overflow-x-auto pb-1 -mb-1 shrink-0">
              {tabs.map((tab) => (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`
                    px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors
                    ${
                      isActive(tab)
                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }
                  `}
                >
                  {tab.label}
                </Link>
              ))}
            </Stack>
          )}

          {/* Search */}
          {showSearch && (
            <form onSubmit={handleSearch} className="w-full sm:w-auto shrink-0">
              <Input
                placeholder="Search archive..."
                leftIcon={<Icon name="search" size="sm" />}
                className="w-full sm:w-48"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </form>
          )}
        </Stack>
      </div>
    </div>
  );
}
