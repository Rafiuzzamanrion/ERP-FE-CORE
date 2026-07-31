"use client";

import { memo } from "react";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PopupVariant } from "./popup";

const variantConfig: Record<
  PopupVariant,
  {
    icon: typeof CheckCircle2;
    iconBgClass: string;
    bgClass: string;
    borderClass: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconBgClass: "bg-[#22c55e]",
    bgClass: "bg-[#f0fdf4] dark:bg-[#022c22]",
    borderClass: "border-[#bbf7d0]/60 dark:border-[#064e3b]",
  },
  error: {
    icon: XCircle,
    iconBgClass: "bg-[#ef4444]",
    bgClass: "bg-[#fef2f2] dark:bg-[#450a0a]",
    borderClass: "border-[#fecaca]/60 dark:border-[#7f1d1d]",
  },
  warning: {
    icon: AlertCircle,
    iconBgClass: "bg-[#f59e0b]",
    bgClass: "bg-[#fffbeb] dark:bg-[#451a03]",
    borderClass: "border-[#fde68a]/60 dark:border-[#78350f]",
  },
  info: {
    icon: Info,
    iconBgClass: "bg-[#3b82f6]",
    bgClass: "bg-[#eff6ff] dark:bg-[#172554]",
    borderClass: "border-[#bfdbfe]/60 dark:border-[#1e3a8a]",
  },
};

interface PopupToastProps {
  variant: PopupVariant;
  title: string;
  description?: string;
  visible: boolean;
  onDismiss: () => void;
}

export const PopupToast = memo(function PopupToast({
  variant,
  title,
  description,
  visible,
  onDismiss,
}: PopupToastProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "pointer-events-auto flex w-full max-w-[400px] items-center gap-3.5 rounded-[18px] border px-4 py-3.5 shadow-sm transition-all duration-300",
        config.bgClass,
        config.borderClass,
        visible
          ? "animate-in slide-in-from-right-full fade-in-0 zoom-in-95"
          : "animate-out slide-out-to-right-full fade-out-0 zoom-out-95"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-sm",
          config.iconBgClass
        )}
      >
        <Icon className="h-[22px] w-[22px]" strokeWidth={2.5} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-[14.5px] font-bold text-gray-900 dark:text-foreground tracking-tight leading-tight">
          {title}
        </h3>
        {description && (
          <p className="mt-0.5 text-[13.5px] font-medium text-gray-800 dark:text-muted-foreground leading-snug break-words">
            {description}
          </p>
        )}
      </div>

      {/* Dismiss */}
      <button
        type="button"
        onClick={onDismiss}
        className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[10px] bg-white dark:bg-white/10 border border-black/5 dark:border-white/5 text-gray-500 dark:text-gray-300 shadow-sm transition-colors hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Dismiss notification"
      >
        <X className="h-[15px] w-[15px]" strokeWidth={3} />
      </button>
    </div>
  );
});
