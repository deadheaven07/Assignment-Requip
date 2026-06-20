import { useCallback, useEffect, useRef, useState } from 'react';

import type { UserResponse } from './api/types';
import { UserForm } from './components/UserForm';
import { UserTable } from './components/UserTable';
import { ToastViewport, type ToastKind, type ToastMessage } from './components/Toast';

export function App() {
  const [selectedUser, setSelectedUser] = useState<UserResponse>();
  const [toast, setToast] = useState<ToastMessage>();
  const toastTimeoutRef = useRef<number>();

  const dismissToast = useCallback(() => {
    window.clearTimeout(toastTimeoutRef.current);
    setToast(undefined);
  }, []);

  const showToast = useCallback((kind: ToastKind, message: string) => {
    window.clearTimeout(toastTimeoutRef.current);
    setToast({ id: Date.now(), kind, message });
    toastTimeoutRef.current = window.setTimeout(() => setToast(undefined), 3500);
  }, []);

  useEffect(() => {
    return () => {
      window.clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#eef6ff_44%,#f1fbf6_100%)] px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <ToastViewport toast={toast} onDismiss={dismissToast} />
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="rounded-lg border border-white/80 bg-white/75 p-6 shadow-sm backdrop-blur">
          <p className="text-sm font-semibold uppercase text-emerald-700">Requip Assignment</p>
          <h1 className="mt-2 text-3xl font-bold tracking-normal text-slate-950">User Management</h1>
        </header>

        <UserForm
          user={selectedUser}
          onSuccess={() => setSelectedUser(undefined)}
          onCancel={() => setSelectedUser(undefined)}
          onNotify={showToast}
        />
        <UserTable onEdit={setSelectedUser} onNotify={showToast} />
      </div>
    </main>
  );
}
