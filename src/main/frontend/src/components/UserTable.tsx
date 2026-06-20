import { useState } from 'react';

import { useDeleteUser, useGetUsers } from '../hooks/useUsers';

const PAGE_SIZE = 10;

export function UserTable() {
  const [page, setPage] = useState(0);
  const usersQuery = useGetUsers(page, PAGE_SIZE);
  const deleteUser = useDeleteUser();

  const users = usersQuery.data?.content ?? [];
  const canGoPrevious = page > 0 && !usersQuery.isFetching;
  const canGoNext = Boolean(usersQuery.data && !usersQuery.data.last) && !usersQuery.isFetching;

  return (
    <section className="w-full space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-950">Users</h2>
        {usersQuery.isFetching && (
          <div className="flex items-center gap-2 text-sm text-slate-600" role="status" aria-live="polite">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
            Loading
          </div>
        )}
      </div>

      {usersQuery.isError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          Unable to load users. Please try again.
        </div>
      )}

      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700">
                Name
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700">
                Email
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700">
                Mobile
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700">
                Date of Birth
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700">
                PAN
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700">
                Aadhaar
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold text-slate-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="transition-colors duration-150 hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-950">{user.name}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">{user.email}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">{user.primaryMobile}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">{user.dateOfBirth}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">{user.pan}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">{user.aadhaar}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => deleteUser.mutate(user.id)}
                    disabled={deleteUser.isPending}
                    className="rounded-md border border-red-200 px-3 py-1.5 font-medium text-red-700 transition-colors duration-150 hover:border-red-300 hover:bg-red-50 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {!usersQuery.isLoading && users.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No users found.
                </td>
              </tr>
            )}

            {usersQuery.isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  Loading users...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteUser.isError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          Unable to delete user. Please try again.
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Page {page + 1}
          {usersQuery.data ? ` of ${Math.max(usersQuery.data.totalPages, 1)}` : ''}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 0))}
            disabled={!canGoPrevious}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors duration-150 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((currentPage) => currentPage + 1)}
            disabled={!canGoNext}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors duration-150 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
