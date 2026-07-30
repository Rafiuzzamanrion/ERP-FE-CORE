"use client";

import { useMemo, useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { hexToHslString, hexToHsl } from "@/lib/colors";

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
    const { h } = hexToHsl(primaryColorHex);

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

        :root {
          --color-background: hsl(${h} 10% 98%);
          --color-secondary: hsl(${h} 12% 94%);
          --color-secondary-foreground: hsl(${h} 72% 25%);
          --color-muted: hsl(${h} 12% 94%);
          --color-accent: hsl(${h} 12% 94%);
          --color-accent-foreground: hsl(${h} 72% 25%);
          --color-border: hsl(${h} 15% 88%);
          --color-input: hsl(${h} 15% 88%);
          --color-sidebar-accent: hsl(${h} 12% 94%);
          --color-sidebar-border: hsl(${h} 15% 88%);
          
          /* Dynamic scrollbar */
          --color-scrollbar: hsl(${h} 15% 78%);
          --color-scrollbar-hover: hsl(${h} 15% 65%);
        }

        .dark {
          --color-background: hsl(${h} 5% 8%);
          --color-secondary: hsl(${h} 10% 14%);
          --color-secondary-foreground: hsl(${h} 50% 90%);
          --color-muted: hsl(${h} 10% 14%);
          --color-accent: hsl(${h} 12% 16%);
          --color-accent-foreground: hsl(${h} 50% 90%);
          --color-border: hsl(${h} 12% 16%);
          --color-input: hsl(${h} 12% 16%);
          --color-sidebar-accent: hsl(${h} 10% 14%);
          --color-sidebar-border: hsl(${h} 12% 16%);
          
          /* Dynamic scrollbar */
          --color-scrollbar: hsl(${h} 10% 28%);
          --color-scrollbar-hover: hsl(${h} 10% 38%);
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
