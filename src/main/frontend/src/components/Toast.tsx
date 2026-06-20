export type ToastKind = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastProps {
  toast?: ToastMessage;
  onDismiss: () => void;
}

const toneByKind: Record<ToastKind, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-red-200 bg-red-50 text-red-900',
  info: 'border-sky-200 bg-sky-50 text-sky-900',
};

const dotByKind: Record<ToastKind, string> = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  info: 'bg-sky-500',
};

export function ToastViewport({ toast, onDismiss }: ToastProps) {
  if (!toast) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-50 w-[calc(100vw-2rem)] max-w-sm" role="status" aria-live="polite">
      <div className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg shadow-slate-200/80 ${toneByKind[toast.kind]}`}>
        <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${dotByKind[toast.kind]}`} />
        <p className="min-w-0 flex-1 text-sm font-semibold leading-5">{toast.message}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-md px-2 text-sm font-semibold opacity-70 transition hover:bg-white/60 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/80"
          aria-label="Dismiss notification"
        >
          x
        </button>
      </div>
    </div>
  );
}
