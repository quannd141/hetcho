import Link from 'next/link';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  hint?: string;
}

export function EmptyState({
  icon = '✨',
  title,
  description,
  primaryAction,
  secondaryAction,
  hint,
}: EmptyStateProps) {
  return (
    <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl py-12 px-6 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-md mx-auto">{description}</p>}
      {(primaryAction || secondaryAction) && (
        <div className="mt-5 flex gap-3 justify-center">
          {primaryAction && (
            <Link
              href={primaryAction.href}
              className="rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700"
            >
              {primaryAction.label}
            </Link>
          )}
          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              {secondaryAction.label}
            </Link>
          )}
        </div>
      )}
      {hint && <p className="mt-4 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
