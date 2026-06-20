import { UserForm } from './components/UserForm';
import { UserTable } from './components/UserTable';

export function App() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#eef6ff_44%,#f1fbf6_100%)] px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="rounded-lg border border-white/80 bg-white/75 p-6 shadow-sm backdrop-blur">
          <p className="text-sm font-semibold uppercase text-emerald-700">Requip Assignment</p>
          <h1 className="mt-2 text-3xl font-bold tracking-normal text-slate-950">User Management</h1>
        </header>

        <UserForm />
        <UserTable />
      </div>
    </main>
  );
}
