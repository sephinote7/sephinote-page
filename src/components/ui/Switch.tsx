"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className = "", label, description, id, disabled, ...props }, ref) => {
    const switchId = id || label?.toLowerCase().replace(/\s/g, "-");

    return (
      <label
        htmlFor={switchId}
        className={`
          inline-flex items-start gap-3 cursor-pointer select-none
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${className}
        `}
      >
        <div className="relative flex-shrink-0 mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={switchId}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <div
            className={`
              w-11 h-6 rounded-full
              bg-zinc-200 dark:bg-zinc-700
              peer-checked:bg-blue-600
              peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2
              transition-colors duration-200
            `}
          />
          <div
            className={`
              absolute top-0.5 left-0.5
              w-5 h-5 rounded-full
              bg-white shadow-sm
              peer-checked:translate-x-5
              transition-transform duration-200
            `}
          />
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {label}
              </span>
            )}
            {description && (
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Switch.displayName = "Switch";

export default Switch;
