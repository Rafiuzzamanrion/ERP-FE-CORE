import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchInputProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  initialValue?: string;
}

export function SearchInput({
  onSearch,
  placeholder = "Search...",
  debounceMs = 300,
  initialValue = "",
}: SearchInputProps) {
  const [value, setValue] = useState(initialValue);
  const debouncedValue = useDebounce(value, debounceMs);

  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Only trigger onSearch if the debouncedValue actually differs from initialValue
  // or after the user has typed something.
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    onSearchRef.current(debouncedValue);
  }, [debouncedValue]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-8"
      />
      {value && (
        <button
          onClick={() => setValue("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
