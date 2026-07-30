"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface NavTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function NavTabs({ className, children, ...props }: NavTabsProps) {
  return (
    <div className={cn("w-full overflow-x-auto pb-2", className)} {...props}>
      <nav className="inline-flex w-max items-center gap-1 rounded-2xl border bg-muted/50 p-1.5 shadow-sm backdrop-blur-md">
        {children}
      </nav>
    </div>
  );
}

export interface NavTabItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

export const NavTabItem = React.forwardRef<HTMLAnchorElement, NavTabItemProps>(
  ({ className, href, icon, isActive, children, ...props }, ref) => {
    const pathname = usePathname();
    // Auto-detect active state if not explicitly provided
    const active =
      isActive ?? (pathname === href || pathname?.startsWith(`${href}/`));

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          "inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          active
            ? "bg-primary/15 text-primary shadow-sm ring-1 ring-primary/20"
            : "text-muted-foreground hover:text-foreground hover:bg-background/50",
          className
        )}
        {...props}
      >
        {icon && (
          <span
            className={cn(
              "flex h-4 w-4 items-center justify-center",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            {icon}
          </span>
        )}
        {children}
      </Link>
    );
  }
);
NavTabItem.displayName = "NavTabItem";
