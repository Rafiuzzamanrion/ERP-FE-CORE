import toast from "react-hot-toast";
import { createElement } from "react";
import { PopupToast } from "./PopupToast";

export type PopupVariant = "success" | "error" | "warning" | "info";

interface PopupOptions {
  description?: string;
  duration?: number;
  id?: string;
}

function show(variant: PopupVariant, title: string, options?: PopupOptions) {
  const toastId = toast.custom(
    (t) =>
      createElement(PopupToast, {
        variant,
        title,
        description: options?.description,
        visible: t.visible,
        onDismiss: () => toast.dismiss(t.id),
      }),
    {
      duration: options?.duration ?? 1800,
      id: options?.id,
    }
  );
  return toastId;
}

export const popup = {
  success: (title: string, options?: PopupOptions) =>
    show("success", title, options),

  error: (title: string, options?: PopupOptions) =>
    show("error", title, options),

  warning: (title: string, options?: PopupOptions) =>
    show("warning", title, options),

  info: (title: string, options?: PopupOptions) => show("info", title, options),

  dismiss: (id?: string) => toast.dismiss(id),
  dismissAll: () => toast.dismiss(),
};
