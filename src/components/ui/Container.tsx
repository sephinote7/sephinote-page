import { HTMLAttributes, forwardRef } from "react";

type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
  centered?: boolean;
}

const sizeStyles: Record<ContainerSize, string> = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-full",
};

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className = "", size = "lg", centered = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          w-full px-4 sm:px-6 lg:px-8
          ${sizeStyles[size]}
          ${centered ? "mx-auto" : ""}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = "Container";

export default Container;
