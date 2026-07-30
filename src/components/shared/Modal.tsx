import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ModalProps extends React.ComponentPropsWithoutRef<typeof Dialog> {
  children: React.ReactNode;
}

export function Modal({ children, ...props }: ModalProps) {
  return <Dialog {...props}>{children}</Dialog>;
}

interface ModalContentProps extends React.ComponentPropsWithoutRef<
  typeof DialogContent
> {}

export const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  ModalContentProps
>(({ className, children, ...props }, ref) => (
  <DialogContent
    ref={ref}
    className={cn(
      "flex flex-col p-0 gap-0 overflow-hidden max-h-[90vh] sm:max-w-xl",
      className
    )}
    {...props}
  >
    {children}
  </DialogContent>
));
ModalContent.displayName = "ModalContent";

interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export const ModalHeaderComponent = React.forwardRef<
  HTMLDivElement,
  ModalHeaderProps
>(({ className, title, description, children, ...props }, ref) => (
  <DialogHeader
    className={cn(
      "px-6 py-4 border-b shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}
    {...props}
  >
    {title && <DialogTitle>{title}</DialogTitle>}
    {description && <DialogDescription>{description}</DialogDescription>}
    {children}
  </DialogHeader>
));
ModalHeaderComponent.displayName = "ModalHeader";

export const ModalBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-y-auto px-6 py-6", className)}
    {...props}
  />
));
ModalBody.displayName = "ModalBody";

export const ModalFooterComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <DialogFooter
    className={cn("px-6 py-4 border-t bg-muted/20 shrink-0 mt-auto", className)}
    {...props}
  />
));
ModalFooterComponent.displayName = "ModalFooter";

// We re-export them cleanly
export {
  ModalHeaderComponent as ModalHeader,
  ModalFooterComponent as ModalFooter,
};
