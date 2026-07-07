import { useRef, useState, useCallback } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  value?: File | null;
  onChange?: (file: File | null) => void;
  existingUrl?: string;
  onFileSelect?: (file: File) => void;
  previewUrl?: string;
  isUploading?: boolean;
  error?: string;
}

export function ImageUploader({
  onChange,
  existingUrl,
  onFileSelect,
  previewUrl: propPreviewUrl,
  isUploading = false,
  error,
}: ImageUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayPreview = localPreview ?? existingUrl ?? propPreviewUrl;

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      setLocalPreview(url);
      onChange?.(file);
      onFileSelect?.(file);
    },
    [onChange, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setLocalPreview(null);
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          isUploading && "pointer-events-none opacity-60"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />

        {displayPreview ? (
          <div className="relative mx-auto inline-block">
            <img
              src={displayPreview}
              alt="Preview"
              className="max-h-48 rounded-lg object-contain"
            />
            <button
              type="button"
              aria-label="Remove image"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drag & drop an image or click to browse
            </p>
            <p className="text-xs text-muted-foreground/60">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/70">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
