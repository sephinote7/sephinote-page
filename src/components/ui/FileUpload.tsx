"use client";

import { InputHTMLAttributes, forwardRef, useState, useRef } from "react";
import Icon from "./Icon";

interface FileUploadProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "onError"> {
  label?: string;
  description?: string;
  accept?: string;
  maxSize?: number;
  preview?: string;
  variant?: "default" | "avatar";
  onChange?: (file: File | null) => void;
  onError?: (error: string) => void;
}

const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      className = "",
      label,
      description,
      accept = "image/*",
      maxSize = 2 * 1024 * 1024,
      preview,
      variant = "default",
      onChange,
      onError,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(preview);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (file: File | null) => {
      if (!file) {
        setPreviewUrl(undefined);
        onChange?.(null);
        return;
      }

      if (file.size > maxSize) {
        onError?.(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
        return;
      }

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onChange?.(file);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileChange(file);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      handleFileChange(file);
    };

    const handleClick = () => {
      if (!disabled) {
        inputRef.current?.click();
      }
    };

    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      setPreviewUrl(undefined);
      onChange?.(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    };

    if (variant === "avatar") {
      return (
        <div className={`flex items-center gap-4 ${className}`}>
          <div
            onClick={handleClick}
            className={`
              relative group cursor-pointer
              w-24 h-24 rounded-full overflow-hidden
              bg-zinc-100 dark:bg-zinc-800
              border-2 border-dashed border-zinc-300 dark:border-zinc-600
              hover:border-blue-400 dark:hover:border-blue-500
              transition-colors
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Icon name="plus" size="lg" className="text-white" />
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon name="plus" size="xl" className="text-zinc-400" />
              </div>
            )}
          </div>
          <div>
            {label && (
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                {label}
              </p>
            )}
            {description && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {description}
              </p>
            )}
            {previewUrl && (
              <button
                onClick={handleRemove}
                className="text-sm text-red-500 hover:text-red-600 mt-1"
              >
                Remove
              </button>
            )}
          </div>
          <input
            ref={(node) => {
              (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
              if (typeof ref === "function") {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            disabled={disabled}
            className="hidden"
            {...props}
          />
        </div>
      );
    }

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            {label}
          </label>
        )}
        <div
          onClick={handleClick}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`
            relative cursor-pointer
            border-2 border-dashed rounded-lg
            transition-colors duration-200
            ${
              isDragging
                ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "border-zinc-300 dark:border-zinc-600 hover:border-blue-400 dark:hover:border-blue-500"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          {previewUrl ? (
            <div className="relative p-4">
              <div className="flex items-center gap-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    File selected
                  </p>
                  <button
                    onClick={handleRemove}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Remove file
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <Icon name="plus" size="xl" className="text-zinc-400 mb-2" />
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Click to upload
              </p>
              {description && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {description}
                </p>
              )}
            </div>
          )}
        </div>
        <input
          ref={(node) => {
            (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
          {...props}
        />
      </div>
    );
  }
);

FileUpload.displayName = "FileUpload";

export default FileUpload;
