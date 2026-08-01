"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface UpdateOptions {
  /** Should the page scroll to the top on parameter change? Default: false */
  scroll?: boolean;
  /** Keys that, when updated, should automatically reset the 'page' parameter to 1 (or delete it) */
  resetPageOnKeys?: string[];
  /** Whether to use router.push instead of router.replace. Default: false (uses replace) */
  push?: boolean;
}

export function useQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParams = useCallback(
    (
      updates: Record<string, string | number | null | undefined>,
      options?: UpdateOptions
    ) => {
      const next = new URLSearchParams(searchParams.toString());

      let shouldResetPage = false;
      const resetKeys = options?.resetPageOnKeys || [];

      Object.entries(updates).forEach(([key, value]) => {
        // If the value is for a key that requires pagination reset, and it's actually changing
        if (resetKeys.includes(key) && next.get(key) !== String(value || "")) {
          shouldResetPage = true;
        }

        if (value === null || value === undefined || value === "") {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });

      if (shouldResetPage) {
        next.delete("page");
      }

      const query = next.toString();
      const url = query ? `${pathname}?${query}` : pathname;

      const navigateOptions = { scroll: options?.scroll ?? false };

      if (options?.push) {
        router.push(url, navigateOptions);
      } else {
        router.replace(url, navigateOptions);
      }
    },
    [searchParams, pathname, router]
  );

  return { setParams, searchParams };
}
