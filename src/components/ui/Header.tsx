import { HTMLAttributes, forwardRef } from "react";

type HeaderSize = "sm" | "md" | "lg" | "xl";
type HeaderAlign = "left" | "center" | "right";

interface HeaderProps extends HTMLAttributes<HTMLElement> {
  size?: HeaderSize;
  align?: HeaderAlign;
  title?: string;
  subtitle?: string;
  backgroundVariant?: "default" | "gradient" | "dark";
}

const sizeStyles: Record<HeaderSize, { padding: string; titleSize: string; subtitleSize: string }> = {
  sm: {
    padding: "py-8 md:py-12",
    titleSize: "text-2xl md:text-3xl",
    subtitleSize: "text-base",
  },
  md: {
    padding: "py-12 md:py-16",
    titleSize: "text-3xl md:text-4xl",
    subtitleSize: "text-lg",
  },
  lg: {
    padding: "py-16 md:py-24",
    titleSize: "text-4xl md:text-5xl",
    subtitleSize: "text-xl",
  },
  xl: {
    padding: "py-24 md:py-32",
    titleSize: "text-5xl md:text-6xl",
    subtitleSize: "text-xl md:text-2xl",
  },
};

const alignStyles: Record<HeaderAlign, string> = {
  left: "text-left items-start",
  center: "text-center items-center",
  right: "text-right items-end",
};

const backgroundStyles = {
  default: "bg-white dark:bg-zinc-900",
  gradient: "bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800",
  dark: "bg-zinc-900 dark:bg-black text-white",
};

const Header = forwardRef<HTMLElement, HeaderProps>(
  (
    {
      className = "",
      size = "md",
      align = "center",
      title,
      subtitle,
      backgroundVariant = "default",
      children,
      ...props
    },
    ref
  ) => {
    const sizeConfig = sizeStyles[size];

    return (
      <header
        ref={ref}
        className={`
          w-full
          ${sizeConfig.padding}
          ${backgroundStyles[backgroundVariant]}
          ${className}
        `}
        {...props}
      >
        <div className={`max-w-4xl mx-auto px-4 flex flex-col ${alignStyles[align]}`}>
          {title && (
            <h1
              className={`
                font-bold tracking-tight
                ${sizeConfig.titleSize}
                ${backgroundVariant === "dark" ? "text-white" : "text-zinc-900 dark:text-zinc-100"}
              `}
            >
              {title}
            </h1>
          )}
          {subtitle && (
            <p
              className={`
                mt-4 max-w-2xl
                ${sizeConfig.subtitleSize}
                ${backgroundVariant === "dark" ? "text-zinc-300" : "text-zinc-600 dark:text-zinc-400"}
              `}
            >
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </header>
    );
  }
);

Header.displayName = "Header";

export default Header;
