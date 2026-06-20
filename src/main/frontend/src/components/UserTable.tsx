import { useEffect, useRef, useState } from 'react';

import type { UserResponse } from '../api/types';
import { useDeleteUser, useGetUsers } from '../hooks/useUsers';
import type { ToastKind } from './Toast';

const PAGE_SIZE = 10;

interface UserTableProps {
  onEdit: (user: UserResponse) => void;
  onNotify?: (kind: ToastKind, message: string) => void;
}

export function UserTable({ onEdit, onNotify }: UserTableProps) {
  const [page, setPage] = useState(0);
  const loadErrorNotifiedRef = useRef(false);
  const usersQuery = useGetUsers(page, PAGE_SIZE);
  const deleteUser = useDeleteUser();

  const users = usersQuery.data?.content ?? [];
  const canGoPrevious = page > 0 && !usersQuery.isFetching;
  const canGoNext = Boolean(usersQuery.data && !usersQuery.data.last) && !usersQuery.isFetching;

  useEffect(() => {
    if (usersQuery.isError && !loadErrorNotifiedRef.current) {
      onNotify?.('error', 'Unable to load users. Please try again.');
      loadErrorNotifiedRef.current = true;
    }

    if (!usersQuery.isError) {
      loadErrorNotifiedRef.current = false;
    }
  }, [onNotify, usersQuery.isError]);

  function handleDelete(userId: number) {
    deleteUser.mutate(userId, {
      onSuccess: () => {
        onNotify?.('success', 'User deleted successfully.');
      },
      onError: () => {
        onNotify?.('error', 'Unable to delete user. Please try again.');
      },
    });
  }

  return (
    <section className="ui-card w-full space-y-4 p-5 sm:p-6">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Users</h2>
          <p className="mt-1 text-sm text-slate-600">Active records are shown newest first.</p>
        </div>
        {usersQuery.isFetching && (
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700" role="status" aria-live="polite">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-sky-200 border-t-sky-700" />
            Loading
          </div>
        )}
      </div>

      {usersQuery.isError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          Unable to load users. Please try again.
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-950 text-white">
            <tr>
              <th scope="col" className="px-4 py-3 text-left font-semibold">
                Name
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold">
                Email
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold">
                Mobile
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold">
                Secondary
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold">
                Date of Birth
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold">
                Birth Place
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold">
                Current Address
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold">
                Permanent Address
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold">
                PAN
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold">
                Aadhaar
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="transition-all duration-200 hover:bg-emerald-50/70 hover:shadow-[inset_4px_0_0_#10b981]">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-950">{user.name}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">{user.email}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">{user.primaryMobile}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">{user.secondaryMobile || '-'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">{user.dateOfBirth}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">{user.placeOfBirth || '-'}</td>
                <td className="max-w-64 px-4 py-3 text-slate-700">
                  <span className="line-clamp-2">{user.currentAddress || '-'}</span>
                </td>
                <td className="max-w-64 px-4 py-3 text-slate-700">
                  <span className="line-clamp-2">{user.permanentAddress || '-'}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">{user.pan}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">{user.aadhaar}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(user)}
                      className="rounded-md border border-sky-200 bg-white px-3 py-1.5 font-medium text-sky-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-200"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(user.id)}
                      disabled={deleteUser.isPending}
                      className="rounded-md border border-red-200 bg-white px-3 py-1.5 font-medium text-red-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 hover:text-red-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!usersQuery.isLoading && users.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-slate-500">
                  No users found.
                </td>
              </tr>
            )}

            {usersQuery.isLoading && (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-slate-500">
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

      <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
        <p className="text-sm text-slate-600">
          Page {page + 1}
          {usersQuery.data ? ` of ${Math.max(usersQuery.data.totalPages, 1)}` : ''}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 0))}
            disabled={!canGoPrevious}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:text-slate-950 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((currentPage) => currentPage + 1)}
            disabled={!canGoNext}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:text-slate-950 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
