import { memo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { slideUp } from "@/lib/motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sparkline } from "./Sparkline";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
  sparklineData?: number[];
  index?: number;
  accent?: "teal" | "blue" | "amber" | "rose";
}

const accentConfig = {
  teal: {
    iconBg: "bg-gradient-to-br from-stat-teal-light to-stat-teal-dark",
    iconColor: "text-primary-foreground",
    shadow: "shadow-stat-teal/20",
    topLine: "bg-stat-teal",
    glow: "group-hover:shadow-stat-teal/15",
    sparkline: "var(--color-chart-1)",
  },
  blue: {
    iconBg: "bg-gradient-to-br from-stat-sky-light to-stat-sky-dark",
    iconColor: "text-primary-foreground",
    shadow: "shadow-stat-sky/20",
    topLine: "bg-stat-sky",
    glow: "group-hover:shadow-stat-sky/15",
    sparkline: "var(--color-chart-3)",
  },
  amber: {
    iconBg: "bg-gradient-to-br from-stat-amber-light to-stat-amber-dark",
    iconColor: "text-primary-foreground",
    shadow: "shadow-stat-amber/20",
    topLine: "bg-stat-amber",
    glow: "group-hover:shadow-stat-amber/15",
    sparkline: "var(--color-chart-8)",
  },
  rose: {
    iconBg: "bg-gradient-to-br from-stat-rose-light to-stat-rose-dark",
    iconColor: "text-primary-foreground",
    shadow: "shadow-stat-rose/20",
    topLine: "bg-stat-rose",
    glow: "group-hover:shadow-stat-rose/15",
    sparkline: "var(--color-chart-7)",
  },
};

export const StatCard = memo(function StatCard({
  title,
  value,
  icon,
  trend,
  sparklineData,
  index = 0,
  accent = "teal",
}: StatCardProps) {
  const config = accentConfig[accent];

  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Card
        className={cn(
          "relative overflow-hidden border border-border/60 bg-gradient-to-br from-card to-muted/30",
          "shadow-sm transition-all duration-300 ease-out",
          "hover:-translate-y-1 hover:shadow-lg",
          config.glow
        )}
      >
        <CardContent className="relative z-10 flex flex-col p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {title}
              </p>
              <p className="mt-1.5 text-3xl font-bold tracking-tight tabular-nums">
                {value}
              </p>
              {trend ? (
                <div className="mt-2 flex items-center gap-1.5">
                  {trend.positive ? (
                    <TrendingUp className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                  )}
                  <Badge
                    variant={trend.positive ? "success" : "destructive"}
                    className="text-[10px] font-medium px-1.5 py-0"
                  >
                    {trend.value}
                  </Badge>
                </div>
              ) : (
                <div className="mt-2 h-5" />
              )}
            </div>
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                "bg-gradient-to-br shadow-lg",
                config.iconBg,
                config.shadow
              )}
            >
              <span className={config.iconColor}>{icon}</span>
            </div>
          </div>

          {sparklineData && sparklineData.length > 0 && (
            <div className="mt-4 h-10 w-full">
              <Sparkline
                data={sparklineData}
                color={config.sparkline}
                fillOpacity={0.2}
                strokeWidth={2}
                height={40}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});
