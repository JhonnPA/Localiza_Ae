import { useEffect } from "react";

import { useAppStore, type ToastType } from "../store/useAppStore";

const TOAST_DURATION_MS = 3000;

const BACKGROUND_BY_TYPE: Record<ToastType, string> = {
  error: "bg-red-600",
  success: "bg-green-600",
  info: "bg-primary",
};

export default function Toast() {
  const toast = useAppStore((state) => state.toast);
  const dismissToast = useAppStore((state) => state.dismissToast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(dismissToast, TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  if (!toast) return null;

  return (
    <div className="fixed right-4 top-4 z-[60]">
      <div
        className={`${BACKGROUND_BY_TYPE[toast.type]} rounded-lg px-4 py-2 text-white shadow-lg`}
      >
        {toast.message}
      </div>
    </div>
  );
}
