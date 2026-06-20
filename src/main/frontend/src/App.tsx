import { UserForm } from './components/UserForm';
import { UserTable } from './components/UserTable';

export function App() {
  return (
    <main className="min-h-screen px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header>
          <h1 className="text-2xl font-bold tracking-normal">User Management</h1>
        </header>

        <UserForm />
        <UserTable />
      </div>
    </main>
  );
}
