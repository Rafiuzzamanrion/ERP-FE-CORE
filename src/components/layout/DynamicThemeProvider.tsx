"use client";

import { useMemo, useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { hexToHslString } from "@/lib/colors";

export function DynamicThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const primaryColorHex = useAppSelector((state) => state.ui.primaryColor);
  const theme = useAppSelector((state) => state.ui.theme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dynamicStyles = useMemo(() => {
    if (!mounted || !primaryColorHex) return null;

    const hslValue = hexToHslString(primaryColorHex);

    return (
      <style>{`
        :root, .dark {
          --color-primary: hsl(${hslValue});
          --color-primary-light: color-mix(in srgb, hsl(${hslValue}) 85%, white);
          --color-ring: hsl(${hslValue});
          --color-sidebar-primary: hsl(${hslValue});
          --color-chart-1: hsl(${hslValue});
          --color-stat-teal: hsl(${hslValue});
          --color-stat-teal-light: color-mix(in srgb, hsl(${hslValue}) 85%, white);
          --color-stat-teal-dark: color-mix(in srgb, hsl(${hslValue}) 80%, black);
        }
      `}</style>
    );
  }, [primaryColorHex, mounted, theme]);

  return (
    <>
      {dynamicStyles}
      {children}
    </>
  );
}
