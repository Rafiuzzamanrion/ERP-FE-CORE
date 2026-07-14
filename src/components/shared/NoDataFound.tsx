import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PackageOpen, SearchX } from "lucide-react";
import { fadeIn, scaleIn } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NoDataFoundProps {
  icon?: ReactNode;
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
      <SearchX className="h-12 w-12 mx-auto" />
    ) : (
      <PackageOpen className="h-12 w-12 mx-auto" />
    );

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed",
        variant === "search" ? "bg-muted/20" : "bg-card"
      )}
    >
      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.25 }}
        className="mb-4 text-muted-foreground/70"
      >
        {icon ?? defaultIcon}
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.2 }}
        className="text-lg font-semibold"
      >
        {displayTitle}
      </motion.h3>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.2 }}
          className="mt-1 max-w-sm text-sm text-muted-foreground"
        >
          {description}
        </motion.p>
      )}
      {ctaLabel && ctaTo && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.2 }}
          className="mt-6"
        >
          <Button asChild>
            <Link href={ctaTo}>{ctaLabel}</Link>
          </Button>
        </motion.div>
      )}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.2 }}
          className="mt-6"
        >
          {action as ReactNode}
        </motion.div>
      )}
    </motion.div>
  );
}

export default NoDataFound;
