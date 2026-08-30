import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export default function EmptyState({
  icon: Icon, title, description, action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-50 ring-1 ring-inset ring-forest-100">
        <Icon className="h-6 w-6 text-forest-600" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-forest-900">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-stone-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
