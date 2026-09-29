import type { ReactNode } from "react";

export default function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm text-muted">{label}</span>
      {children}
    </label>
  );
}
