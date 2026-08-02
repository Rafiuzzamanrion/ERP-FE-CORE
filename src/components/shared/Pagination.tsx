import { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  total?: number;
}

export const Pagination = memo(function Pagination({
  page,
  totalPages,
  setCurrentPage,
  total,
}: PaginationProps) {
  const getVisiblePages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (page >= totalPages - 2)
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-between px-1">
      <p className="text-sm text-muted-foreground">
        {total !== undefined
          ? `Showing ${(page - 1) * 10 + 1}-${Math.min(page * 10, total)} of ${total} entries`
          : `Page ${page} of ${totalPages}`}
      </p>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCurrentPage(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {visiblePages.map((p, index) => (
          <Button
            key={index}
            variant={p === page ? "default" : "outline"}
            size="icon"
            className={cn(
              "h-8 w-8 text-xs",
              p === "..." && "pointer-events-none border-transparent"
            )}
            onClick={() => typeof p === "number" && setCurrentPage(p)}
            disabled={p === "..."}
          >
            {p}
          </Button>
        ))}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCurrentPage(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});
