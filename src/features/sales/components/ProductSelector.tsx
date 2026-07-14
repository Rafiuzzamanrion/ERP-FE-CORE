"use client";

import { memo, useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Package } from "lucide-react";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface ProductSelectorProps {
  products: Product[];
  isLoading?: boolean;
  onSelect: (product: Product) => void;
  excludeIds?: string[];
}

export default memo(function ProductSelector({
  products,
  isLoading = false,
  onSelect,
  excludeIds = [],
}: ProductSelectorProps) {
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase();
    return products.filter(
      (p) =>
        p.stockQuantity > 0 &&
        !excludeIds.includes(p._id) &&
        (!term ||
          p.name.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term))
    );
  }, [products, search, excludeIds]);

  const handleSelect = useCallback(
    (product: Product) => {
      onSelect(product);
      setSearch("");
      setActiveIndex(-1);
    },
    [onSelect]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < filteredProducts.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : filteredProducts.length - 1
      );
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const product = filteredProducts[activeIndex];
      if (product) handleSelect(product);
    } else if (e.key === "Escape") {
      setSearch("");
      setActiveIndex(-1);
    }
  };

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  return (
    <div className="space-y-4">
      <div
        className="relative"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={search.length > 0}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          className="pl-9"
          aria-controls="product-selector-list"
          aria-activedescendant={
            activeIndex >= 0
              ? `product-${filteredProducts[activeIndex]?._id}`
              : undefined
          }
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 border rounded-xl animate-pulse"
            >
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
              <div className="h-5 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div
          id="product-selector-list"
          role="listbox"
          ref={listRef}
          className="space-y-2 max-h-[55vh] overflow-y-auto pr-1"
        >
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Package className="h-10 w-10 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No products found</p>
            </div>
          )}
          {filteredProducts.map((product, index) => (
            <button
              key={product._id}
              id={`product-${product._id}`}
              role="option"
              aria-selected={index === activeIndex}
              type="button"
              onClick={() => handleSelect(product)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all",
                index === activeIndex
                  ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
                  : "bg-card hover:bg-muted/50 hover:border-muted-foreground/20"
              )}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-10 w-10 rounded-lg object-cover border"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.sku}</p>
                </div>
              </div>
              <Badge
                variant={
                  product.stockQuantity > 5
                    ? "success"
                    : product.stockQuantity > 0
                      ? "warning"
                      : "secondary"
                }
                className="ml-2 shrink-0"
              >
                {product.stockQuantity} in stock
              </Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
