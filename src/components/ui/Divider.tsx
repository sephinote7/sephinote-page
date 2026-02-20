import { HTMLAttributes, forwardRef } from "react";

type DividerOrientation = "horizontal" | "vertical";
type DividerVariant = "solid" | "dashed" | "dotted";

interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  label?: string;
}

const variantStyles: Record<DividerVariant, string> = {
  solid: "border-solid",
  dashed: "border-dashed",
  dotted: "border-dotted",
};

const Divider = forwardRef<HTMLDivElement, DividerProps>(
  (
    { className = "", orientation = "horizontal", variant = "solid", label, ...props },
    ref
  ) => {
    if (label && orientation === "horizontal") {
      return (
        <div
          ref={ref}
          className={`flex items-center ${className}`}
          {...props}
        >
          <div
            className={`
              flex-1 border-t border-zinc-200 dark:border-zinc-700
              ${variantStyles[variant]}
            `}
          />
          <span className="px-3 text-sm text-zinc-500 dark:text-zinc-400">
            {label}
          </span>
          <div
            className={`
              flex-1 border-t border-zinc-200 dark:border-zinc-700
              ${variantStyles[variant]}
            `}
          />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`
          ${
            orientation === "horizontal"
              ? "w-full border-t"
              : "h-full border-l self-stretch"
          }
          border-zinc-200 dark:border-zinc-700
          ${variantStyles[variant]}
          ${className}
        `}
        {...props}
      />
    );
  }
);

Divider.displayName = "Divider";

export default Divider;
