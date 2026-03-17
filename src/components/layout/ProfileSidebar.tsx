"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Avatar, Stack, Icon } from "@/components/ui";
import type { Profile } from "@/types";
import githubBlackPng from "@/img/github_black.png";
import githubWhitePng from "@/img/github_white.png";
import darkmodeIconPng from "@/img/darkmode_icon.png";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  {
    id: 'all',
    label: 'All Boards',
    href: '/',
    icon: <Icon name="menu" size="sm" />,
  },
  {
    id: 'works',
    label: 'Works',
    href: '/life?category=portfolio',
    icon: <Icon name="bookmark" size="sm" />,
  },
  {
    id: 'food',
    label: 'Food',
    href: '/life?category=food',
    icon: <Icon name="heart" size="sm" />,
  },
  {
    id: 'drawing',
    label: 'Drawing',
    href: '/life?category=drawing',
    icon: <Icon name="plus" size="sm" />,
  },
];

interface ProfileSidebarProps {
  profile: Profile | null;
  onNavigate?: () => void;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export default function ProfileSidebar({
  profile,
  onNavigate,
  onClose,
  showCloseButton,
}: ProfileSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [boardsExpanded, setBoardsExpanded] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [hasMounted, setHasMounted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAdmin(!!user);
    }
    checkAuth();
  }, [supabase]);

  // 테마 초기화
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("theme");
    const initialTheme = stored === "dark" ? "dark" : "light";
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", next === "dark");
      window.localStorage.setItem("theme", next);
    }
  };

  const handleCopyEmail = async () => {
    const email = "sephinote@gmail.com";
    try {
      await navigator.clipboard.writeText(email);
      alert("메일 주소가 복사되었습니다.");
    } catch {
      alert("복사에 실패했습니다. 수동으로 복사해주세요.");
    }
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' && !searchParams.get('sort');
    }
    if (href.includes('?')) {
      const [path, query] = href.split('?');
      if (pathname !== path) return false;
      const params = new URLSearchParams(query);
      for (const [key, value] of params.entries()) {
        if (searchParams.get(key) !== value) return false;
      }
      return true;
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      // /life 페이지 내에서 카테고리 전환 시 부드럽게 처리
      if (pathname === '/life' && href.startsWith('/life?')) {
        e.preventDefault();
        onNavigate?.();
        startTransition(() => {
          router.replace(href, { scroll: false });
        });
      }
    },
    [pathname, router, onNavigate],
  );

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
            alt={profile?.username || 'Profile'}
            className="w-24 h-24 ring-4 ring-blue-100 dark:ring-blue-900/30"
          />
          <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-zinc-900" />
        </div>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {profile?.username || 'Portfolio'}
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
          {profile?.bio || "Digital Creator & Developer"}
        </p>

        <p className="mt-4 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          Contact Me!
        </p>

        {/* Social Icons */}
        <Stack direction="row" gap="sm" justify="center" className="mt-2">
          {/* GitHub */}
          <a
            href="https://github.com/sephinote7?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            aria-label="GitHub"
          >
            <Image
              src={theme === "dark" ? githubWhitePng : githubBlackPng}
              alt="GitHub"
              width={18}
              height={18}
            />
          </a>
          {/* Email modal */}
          <button
            onClick={() => setShowEmailModal(true)}
            className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            aria-label="Email"
          >
            <Icon name="chat" size="sm" />
          </button>
          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            <Image src={darkmodeIconPng} alt="Dark mode" width={18} height={18} />
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
          {/* Home */}
          <Link
            href="/"
            onClick={onNavigate}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <span className="text-zinc-400">
              <Icon name="bookmark" size="sm" />
            </span>
            Home
          </Link>

          {/* All Boards (토글 + 링크) */}
          <button
            onClick={() => {
              setBoardsExpanded((prev) => !prev);
              onNavigate?.();
              router.push('/');
            }}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <span className="flex items-center gap-3">
              <span className="text-zinc-400">
                <Icon name="menu" size="sm" />
              </span>
              All Boards
            </span>
            <span className="text-xs">{boardsExpanded ? '−' : '+'}</span>
          </button>

          {/* Child boards */}
          {boardsExpanded && (
            <Stack gap="xs" className="mt-1 ml-4">
              {menuItems
                .filter((item) => item.id !== 'all')
                .map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={(e) => {
                      handleNavClick(e, item.href);
                      if (!e.defaultPrevented) onNavigate?.();
                    }}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${
                        isActive(item.href)
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }
                    `}
                  >
                    <span
                      className={isActive(item.href) ? 'text-white' : 'text-zinc-400'}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                ))}
            </Stack>
          )}
        </Stack>
      </div>

      {/* Email Modal (Portal: transform 영향 제거) */}
      {hasMounted &&
        showEmailModal &&
        createPortal(
          <div
            className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center bg-black/40"
            style={{ zIndex: 9999 }}
          >
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-6 w-80">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Contact Me
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">
                아래 메일 주소로 연락 주세요.
              </p>
              <div className="mb-4">
                <code className="block w-full px-3 py-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-800 dark:text-zinc-100">
                  sephinote@gmail.com
                </code>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={handleCopyEmail}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  주소 복사
                </button>
                <a
                  href="mailto:sephinote@gmail.com"
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  메일 보내기
                </a>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  확인
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Admin Link */}
      {isAdmin && (
        <div className="px-4 pb-2">
          <Link
            href="/admin"
            onClick={onNavigate}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
          >
            <Icon name="settings" size="sm" className="text-zinc-500" />
            관리 페이지
          </Link>
        </div>
      )}

      {/* Bottom Section */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <p className="text-xs text-zinc-400 text-center">
          © 2026 {profile?.username || 'Portfolio'}
        </p>
      </div>
    </aside>
  );
}
