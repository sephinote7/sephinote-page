import { HTMLAttributes, forwardRef } from "react";

interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease";
  };
  variant?: "default" | "primary" | "success" | "warning";
}

const variantStyles = {
  default: {
    bg: "bg-zinc-50 dark:bg-zinc-800/50",
    icon: "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300",
  },
  primary: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    icon: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
  },
  success: {
    bg: "bg-green-50 dark:bg-green-900/20",
    icon: "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400",
  },
  warning: {
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    icon: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400",
  },
};

const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  (
    { className = "", icon, label, value, change, variant = "default", ...props },
    ref
  ) => {
    const styles = variantStyles[variant];

    return (
      <div
        ref={ref}
        className={`
          flex items-center gap-4 p-4 rounded-xl
          ${styles.bg}
          ${className}
        `}
        {...props}
      >
        {icon && (
          <div
            className={`
              flex items-center justify-center
              w-12 h-12 rounded-lg
              ${styles.icon}
            `}
          >
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            {change && (
              <span
                className={`
                  text-sm font-medium
                  ${
                    change.type === "increase"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }
                `}
              >
                {change.type === "increase" ? "+" : "-"}
                {Math.abs(change.value)}%
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
);

StatCard.displayName = "StatCard";

export default StatCard;
