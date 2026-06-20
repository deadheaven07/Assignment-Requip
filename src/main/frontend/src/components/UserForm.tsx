import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import type { UserResponse } from '../api/types';
import { userSchema, type UserFormValues } from '../schemas/schema';
import { useCreateUser, useUpdateUser } from '../hooks/useUsers';

interface UserFormProps {
  user?: UserResponse;
  onSuccess?: (user: UserResponse) => void;
}

export function UserForm({ user, onSuccess }: UserFormProps) {
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const isEditMode = Boolean(user);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      primaryMobile: user?.primaryMobile ?? '',
      dateOfBirth: user?.dateOfBirth ?? '',
      pan: '',
      aadhaar: '',
    },
  });

  useEffect(() => {
    reset({
      name: user?.name ?? '',
      email: user?.email ?? '',
      primaryMobile: user?.primaryMobile ?? '',
      dateOfBirth: user?.dateOfBirth ?? '',
      pan: '',
      aadhaar: '',
    });
  }, [reset, user]);

  async function onSubmit(values: UserFormValues) {
    try {
      const response = isEditMode && user
        ? await updateUser.mutateAsync({ id: user.id, payload: values })
        : await createUser.mutateAsync(values);

      if (!isEditMode) {
        reset();
      }

      onSuccess?.(response);
    } catch (error) {
      const message = resolveErrorMessage(error);
      setError('root', { type: 'server', message });
    }
  }

  const submitDisabled = isSubmitting || createUser.isPending || updateUser.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-md border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      {errors.root?.message && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {errors.root.message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name" error={errors.name?.message}>
          <input
            type="text"
            autoComplete="name"
            {...register('name')}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition-colors duration-150 hover:border-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </Field>

        <Field label="Email" error={errors.email?.message}>
          <input
            type="email"
            autoComplete="email"
            {...register('email')}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition-colors duration-150 hover:border-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </Field>

        <Field label="Primary Mobile" error={errors.primaryMobile?.message}>
          <input
            type="tel"
            autoComplete="tel"
            {...register('primaryMobile')}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition-colors duration-150 hover:border-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </Field>

        <Field label="Date of Birth" error={errors.dateOfBirth?.message}>
          <input
            type="date"
            {...register('dateOfBirth')}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition-colors duration-150 hover:border-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </Field>

        <Field label="PAN" error={errors.pan?.message}>
          <input
            type="text"
            autoComplete="off"
            {...register('pan')}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm uppercase outline-none transition-colors duration-150 hover:border-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </Field>

        <Field label="Aadhaar" error={errors.aadhaar?.message}>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            {...register('aadhaar')}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition-colors duration-150 hover:border-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </Field>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitDisabled}
          className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitDisabled ? 'Saving...' : isEditMode ? 'Update User' : 'Create User'}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="space-y-1.5">
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error && <span className="block text-xs text-red-600">{error}</span>}
    </label>
  );
}

function resolveErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    const responseData = error.response?.data;

    if (typeof responseData === 'string') {
      return responseData;
    }

    if (responseData && typeof responseData === 'object' && 'message' in responseData) {
      return String(responseData.message);
    }
  }

  return 'Unable to save user. Please review the form and try again.';
}
