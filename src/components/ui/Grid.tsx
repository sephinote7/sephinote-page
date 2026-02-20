import { HTMLAttributes, forwardRef } from "react";

type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 12;
type GridGap = "none" | "sm" | "md" | "lg" | "xl";

interface GridProps extends HTMLAttributes<HTMLDivElement> {
  cols?: GridCols;
  colsSm?: GridCols;
  colsMd?: GridCols;
  colsLg?: GridCols;
  gap?: GridGap;
}

const colsStyles: Record<GridCols, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  12: "grid-cols-12",
};

const colsSmStyles: Record<GridCols, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
  6: "sm:grid-cols-6",
  12: "sm:grid-cols-12",
};

const colsMdStyles: Record<GridCols, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
  12: "md:grid-cols-12",
};

const colsLgStyles: Record<GridCols, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
  12: "lg:grid-cols-12",
};

const gapStyles: Record<GridGap, string> = {
  none: "gap-0",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

const Grid = forwardRef<HTMLDivElement, GridProps>(
  (
    { className = "", cols = 1, colsSm, colsMd, colsLg, gap = "md", children, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`
          grid
          ${colsStyles[cols]}
          ${colsSm ? colsSmStyles[colsSm] : ""}
          ${colsMd ? colsMdStyles[colsMd] : ""}
          ${colsLg ? colsLgStyles[colsLg] : ""}
          ${gapStyles[gap]}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = "Grid";

export default Grid;
