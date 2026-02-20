import { HTMLAttributes, forwardRef } from "react";
import Icon from "./Icon";

type AlertVariant = "info" | "success" | "warning" | "error" | "danger";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
}

const variantStyles: Record<
  AlertVariant,
  { container: string; icon: string; title: string }
> = {
  info: {
    container:
      "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
    icon: "text-blue-500 dark:text-blue-400",
    title: "text-blue-800 dark:text-blue-300",
  },
  success: {
    container:
      "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
    icon: "text-green-500 dark:text-green-400",
    title: "text-green-800 dark:text-green-300",
  },
  warning: {
    container:
      "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
    icon: "text-yellow-500 dark:text-yellow-400",
    title: "text-yellow-800 dark:text-yellow-300",
  },
  error: {
    container:
      "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
    icon: "text-red-500 dark:text-red-400",
    title: "text-red-800 dark:text-red-300",
  },
  danger: {
    container:
      "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
    icon: "text-red-500 dark:text-red-400",
    title: "text-red-800 dark:text-red-300",
  },
};

const defaultIcons: Record<AlertVariant, React.ReactNode> = {
  info: <Icon name="chat" size="md" />,
  success: <Icon name="check" size="md" />,
  warning: <Icon name="bookmark" size="md" />,
  error: <Icon name="close" size="md" />,
  danger: <Icon name="close" size="md" />,
};

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className = "",
      variant = "info",
      title,
      description,
      icon,
      onClose,
      children,
      ...props
    },
    ref
  ) => {
    const styles = variantStyles[variant];
    const displayIcon = icon ?? defaultIcons[variant];

    return (
      <div
        ref={ref}
        role="alert"
        className={`
          flex gap-3 p-4 rounded-lg border
          ${styles.container}
          ${className}
        `}
        {...props}
      >
        {displayIcon && (
          <div className={`flex-shrink-0 ${styles.icon}`}>{displayIcon}</div>
        )}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`font-medium mb-1 ${styles.title}`}>{title}</h4>
          )}
          {(description || children) && (
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              {description || children}
            </div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Close alert"
          >
            <Icon name="close" size="sm" className="text-zinc-500" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = "Alert";

export default Alert;
