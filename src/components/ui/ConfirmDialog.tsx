'use client';
import { AlertTriangle, Info } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  infoOnly?: boolean;
  onConfirm?: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Ta bort',
  cancelLabel = 'Avbryt',
  danger = true,
  infoOnly = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-sm w-full">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${danger ? 'bg-red-100' : 'bg-blue-100'}`}>
            {danger ? <AlertTriangle className="w-5 h-5 text-red-600" /> : <Info className="w-5 h-5 text-blue-600" />}
          </div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
        </div>
        <p className="text-sm text-slate-600 mb-5 whitespace-pre-line">{message}</p>
        <div className="flex gap-3">
          {!infoOnly && (
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={infoOnly ? onCancel : onConfirm}
            className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg cursor-pointer ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {infoOnly ? 'OK' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
