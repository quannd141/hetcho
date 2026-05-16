'use client';

import { useState, type ReactNode } from 'react';

interface ConfirmDialogProps {
  trigger: ReactNode;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  requireTypeToConfirm?: string;
  onConfirm?: () => void;
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Huỷ',
  variant = 'default',
  requireTypeToConfirm,
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');

  const triggerWithHandler = (
    <span onClick={() => setOpen(true)} className="inline-block">
      {trigger}
    </span>
  );

  if (!open) return triggerWithHandler;

  const canConfirm = !requireTypeToConfirm || typed === requireTypeToConfirm;

  return (
    <>
      {triggerWithHandler}
      <div
        className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center px-6"
        onClick={() => setOpen(false)}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-3">
            <div className={`text-3xl ${variant === 'danger' ? '' : ''}`}>
              {variant === 'danger' ? '⚠️' : '❔'}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold">{title}</h3>
              {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
            </div>
          </div>

          {requireTypeToConfirm && (
            <label className="block mt-4">
              <span className="text-xs text-slate-500">
                Nhập <strong className="font-mono">{requireTypeToConfirm}</strong> để xác nhận:
              </span>
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoFocus
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono"
              />
            </label>
          )}

          <div className="mt-6 flex gap-3 justify-end">
            <button
              onClick={() => {
                setOpen(false);
                setTyped('');
              }}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
            >
              {cancelLabel}
            </button>
            <button
              disabled={!canConfirm}
              onClick={() => {
                onConfirm?.();
                setOpen(false);
                setTyped('');
              }}
              className={`rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                variant === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-brand-600 hover:bg-brand-700'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
