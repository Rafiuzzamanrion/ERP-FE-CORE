import type { ReactNode } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { PackageOpen, SearchX } from "lucide-react";
import { fadeIn, scaleIn } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NoDataFoundProps {
  icon?: ReactNode;
  iconSize?: number;
  title?: string;
  description?: string;
  message?: string;
  ctaLabel?: string;
  ctaTo?: string;
  action?: ReactNode;
  variant?: "empty" | "search";
}

export function NoDataFound({
  icon,
  iconSize = 34,
  title,
  description,
  message,
  ctaLabel,
  ctaTo,
  action,
  variant = "empty",
}: NoDataFoundProps) {
  const displayTitle = title ?? message ?? "No data found";
  const defaultIcon =
    variant === "search" ? (
      <SearchX
        size={iconSize}
        className="text-primary relative z-10"
        strokeWidth={1.3}
      />
    ) : (
      <PackageOpen
        size={iconSize}
        className="text-primary relative z-10"
        strokeWidth={1.3}
      />
    );

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "flex flex-col items-center justify-center py-14 text-center rounded-2xl border border-dashed relative overflow-hidden",
        variant === "search" ? "bg-muted/30" : "bg-card"
      )}
    >
      {/* Premium animated icon wrapper */}
      <motion.div
        variants={itemVariants}
        className="relative flex items-center justify-center mb-8"
        style={{ width: iconSize * 3, height: iconSize * 3 }}
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />

        {/* Pulsing rings */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-primary/5 rounded-full border border-primary/20"
        />
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute -inset-4 bg-primary/5 rounded-full border border-primary/10"
        />

        {/* Solid center circle */}
        <div className="absolute inset-4 bg-primary/10 rounded-full shadow-inner flex items-center justify-center ring-1 ring-primary/20 backdrop-blur-sm">
          {icon ?? defaultIcon}
        </div>
      </motion.div>

      <motion.h3
        variants={itemVariants}
        className="text-2xl font-bold tracking-tight text-foreground"
      >
        {displayTitle}
      </motion.h3>

      {description && (
        <motion.p
          variants={itemVariants}
          className="mt-3 max-w-sm text-sm text-muted-foreground leading-relaxed"
        >
          {description}
        </motion.p>
      )}

      {(ctaLabel && ctaTo) || action ? (
        <motion.div
          variants={itemVariants}
          className="mt-8 flex items-center gap-4"
        >
          {ctaLabel && ctaTo && (
            <Button
              asChild
              size="lg"
              className="rounded-full shadow-md shadow-primary/20 font-semibold px-8 hover:scale-105 transition-transform"
            >
              <Link href={ctaTo}>{ctaLabel}</Link>
            </Button>
          )}
          {action && (
            <div className="[&>button]:rounded-full [&>button]:px-8 [&>button]:shadow-md [&>button]:hover:scale-105 [&>button]:transition-transform">
              {action as ReactNode}
            </div>
          )}
        </motion.div>
      ) : null}
    </motion.div>
  );
}

export default NoDataFound;
