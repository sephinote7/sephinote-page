import { HTMLAttributes, forwardRef } from "react";
import Image from "next/image";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: AvatarSize;
  fallback?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; pixels: number }> = {
  xs: { container: "h-6 w-6", text: "text-xs", pixels: 24 },
  sm: { container: "h-8 w-8", text: "text-sm", pixels: 32 },
  md: { container: "h-10 w-10", text: "text-base", pixels: 40 },
  lg: { container: "h-12 w-12", text: "text-lg", pixels: 48 },
  xl: { container: "h-16 w-16", text: "text-xl", pixels: 64 },
};

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className = "", src, alt = "Avatar", size = "md", fallback, ...props }, ref) => {
    const sizeConfig = sizeStyles[size];
    const initials = fallback || alt.charAt(0).toUpperCase();

    return (
      <div
        ref={ref}
        className={`
          relative inline-flex items-center justify-center
          rounded-full overflow-hidden
          bg-zinc-200 dark:bg-zinc-700
          ${sizeConfig.container}
          ${className}
        `}
        {...props}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            width={sizeConfig.pixels}
            height={sizeConfig.pixels}
            className="object-cover w-full h-full"
          />
        ) : (
          <span
            className={`
              font-medium text-zinc-600 dark:text-zinc-300
              ${sizeConfig.text}
            `}
          >
            {initials}
          </span>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export default Avatar;
