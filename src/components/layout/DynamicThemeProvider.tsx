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

    // We can also calculate a lighter/darker variant if needed,
    // but the easiest approach is to apply the primary color HSL to the relevant variables.
    return (
      <style>{`
        :root {
          --color-primary: hsl(${hslValue});
          --color-ring: hsl(${hslValue});
          --color-sidebar-primary: hsl(${hslValue});
          --color-chart-1: hsl(${hslValue});
          --color-stat-teal: hsl(${hslValue});
        }
        .dark {
          --color-primary: hsl(${hslValue});
          --color-ring: hsl(${hslValue});
          --color-sidebar-primary: hsl(${hslValue});
          --color-chart-1: hsl(${hslValue});
          --color-stat-teal: hsl(${hslValue});
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
