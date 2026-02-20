"use client";

import { HTMLAttributes, forwardRef, useState } from "react";
import Icon from "./Icon";

interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  badge?: string | number;
  children?: SidebarItem[];
}

interface SidebarProps extends HTMLAttributes<HTMLElement> {
  items: SidebarItem[];
  activeId?: string;
  onItemClick?: (item: SidebarItem) => void;
  collapsed?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  (
    {
      className = "",
      items,
      activeId,
      onItemClick,
      collapsed = false,
      header,
      footer,
      ...props
    },
    ref
  ) => {
    const [expandedIds, setExpandedIds] = useState<string[]>([]);

    const toggleExpanded = (id: string) => {
      setExpandedIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    };

    const renderItem = (item: SidebarItem, depth = 0) => {
      const isActive = activeId === item.id;
      const isExpanded = expandedIds.includes(item.id);
      const hasChildren = item.children && item.children.length > 0;

      return (
        <li key={item.id}>
          <button
            onClick={() => {
              if (hasChildren) {
                toggleExpanded(item.id);
              }
              onItemClick?.(item);
            }}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
              text-sm font-medium transition-colors duration-200
              ${depth > 0 ? "ml-4" : ""}
              ${
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }
            `}
          >
            {item.icon && (
              <span className={`flex-shrink-0 ${collapsed ? "mx-auto" : ""}`}>
                {item.icon}
              </span>
            )}
            {!collapsed && (
              <>
                <span className="flex-1 text-left truncate">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                    {item.badge}
                  </span>
                )}
                {hasChildren && (
                  <svg
                    className={`h-4 w-4 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                )}
              </>
            )}
          </button>
          {hasChildren && isExpanded && !collapsed && (
            <ul className="mt-1 space-y-1">
              {item.children!.map((child) => renderItem(child, depth + 1))}
            </ul>
          )}
        </li>
      );
    };

    return (
      <aside
        ref={ref}
        className={`
          flex flex-col
          h-full
          bg-white dark:bg-zinc-900
          border-r border-zinc-200 dark:border-zinc-800
          transition-all duration-300
          ${collapsed ? "w-16" : "w-64"}
          ${className}
        `}
        {...props}
      >
        {header && (
          <div className="flex-shrink-0 p-4 border-b border-zinc-200 dark:border-zinc-800">
            {header}
          </div>
        )}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">{items.map((item) => renderItem(item))}</ul>
        </nav>
        {footer && (
          <div className="flex-shrink-0 p-4 border-t border-zinc-200 dark:border-zinc-800">
            {footer}
          </div>
        )}
      </aside>
    );
  }
);

Sidebar.displayName = "Sidebar";

export default Sidebar;
