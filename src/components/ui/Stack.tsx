import { HTMLAttributes, forwardRef } from "react";

type StackDirection = "row" | "col";
type StackAlign = "start" | "center" | "end" | "stretch" | "baseline";
type StackJustify = "start" | "center" | "end" | "between" | "around" | "evenly";
type StackGap = "none" | "xs" | "sm" | "md" | "lg" | "xl";

interface StackProps extends HTMLAttributes<HTMLDivElement> {
  direction?: StackDirection;
  align?: StackAlign;
  justify?: StackJustify;
  gap?: StackGap;
  wrap?: boolean;
}

const directionStyles: Record<StackDirection, string> = {
  row: "flex-row",
  col: "flex-col",
};

const alignStyles: Record<StackAlign, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

const justifyStyles: Record<StackJustify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

const gapStyles: Record<StackGap, string> = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

const Stack = forwardRef<HTMLDivElement, StackProps>(
  (
    {
      className = "",
      direction = "col",
      align = "stretch",
      justify = "start",
      gap = "md",
      wrap = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`
          flex
          ${directionStyles[direction]}
          ${alignStyles[align]}
          ${justifyStyles[justify]}
          ${gapStyles[gap]}
          ${wrap ? "flex-wrap" : ""}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Stack.displayName = "Stack";

export default Stack;
