"use client";

import { Toaster as HotToaster } from "react-hot-toast";

export function PopupProvider() {
  return (
    <HotToaster
      position="top-right"
      gutter={12}
      containerStyle={{ top: 20, right: 20 }}
      toastOptions={{
        duration: 1800,
        style: {
          background: "transparent",
          padding: 0,
          boxShadow: "none",
          maxWidth: 420,
        },
      }}
    />
  );
}
