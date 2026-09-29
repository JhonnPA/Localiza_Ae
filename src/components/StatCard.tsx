import type { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: ReactNode;
  caption?: string;
  icon?: ReactNode;
};

export default function StatCard({ title, value, caption, icon }: StatCardProps) {
  return (
    <div className="card flex items-center justify-between p-5">
      <div>
        <div className="text-sm text-subtle">{title}</div>
        <div className="mt-1 text-2xl font-bold">{value}</div>
        {caption && <div className="mt-1 text-xs text-subtle">{caption}</div>}
      </div>
      {icon && <div className="text-link">{icon}</div>}
    </div>
  );
}
