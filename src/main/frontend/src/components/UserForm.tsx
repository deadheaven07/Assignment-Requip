import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import type { ChangeEvent, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import type { UserResponse } from '../api/types';
import { userSchema, userUpdateSchema, type UserFormValues } from '../schemas/schema';
import { useCreateUser, useUpdateUser } from '../hooks/useUsers';

interface UserFormProps {
  user?: UserResponse;
  onSuccess?: (user: UserResponse) => void;
  onCancel?: () => void;
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const isEditMode = Boolean(user);
  const [typingField, setTypingField] = useState<keyof UserFormValues | null>(null);
  const typingTimeoutRef = useRef<number>();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(isEditMode ? userUpdateSchema : userSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      primaryMobile: user?.primaryMobile ?? '',
      secondaryMobile: user?.secondaryMobile ?? '',
      dateOfBirth: user?.dateOfBirth ?? '',
      placeOfBirth: user?.placeOfBirth ?? '',
      currentAddress: user?.currentAddress ?? '',
      permanentAddress: user?.permanentAddress ?? '',
      pan: '',
      aadhaar: '',
    },
  });

  useEffect(() => {
    reset({
      name: user?.name ?? '',
      email: user?.email ?? '',
      primaryMobile: user?.primaryMobile ?? '',
      secondaryMobile: user?.secondaryMobile ?? '',
      dateOfBirth: user?.dateOfBirth ?? '',
      placeOfBirth: user?.placeOfBirth ?? '',
      currentAddress: user?.currentAddress ?? '',
      permanentAddress: user?.permanentAddress ?? '',
      pan: '',
      aadhaar: '',
    });
  }, [reset, user]);

  useEffect(() => {
    return () => {
      window.clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  function registerWithTyping(fieldName: keyof UserFormValues) {
    const registration = register(fieldName);

    return {
      ...registration,
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (fieldName === 'pan') {
          event.target.value = event.target.value.toUpperCase();
        }
        registration.onChange(event);
        setTypingField(fieldName);
        window.clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = window.setTimeout(() => setTypingField(null), 900);
      },
    };
  }

  async function onSubmit(values: UserFormValues) {
    try {
      const payload = compactPayload(values);
      const response = isEditMode && user
        ? await updateUser.mutateAsync({ id: user.id, payload })
        : await createUser.mutateAsync(payload);

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
  const inputClassName = 'field-input';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="ui-card space-y-6 p-5 sm:p-6">
      <div className="flex flex-col gap-1 border-b border-slate-100 pb-4">
        <h2 className="text-xl font-semibold text-slate-950">{isEditMode ? 'Update User' : 'Create User'}</h2>
        <p className="text-sm text-slate-600">Capture verified contact and identity details for the user record.</p>
      </div>

      {errors.root?.message && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {errors.root.message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name" error={errors.name?.message} isTyping={typingField === 'name'}>
          <input
            type="text"
            autoComplete="name"
            placeholder="Name "
            {...registerWithTyping('name')}
            className={inputClassName}
          />
        </Field>

        <Field label="Email" error={errors.email?.message} isTyping={typingField === 'email'}>
          <input
            type="email"
            autoComplete="email"
            placeholder="User@example.com"
            {...registerWithTyping('email')}
            className={inputClassName}
          />
        </Field>

        <Field label="Primary Mobile" error={errors.primaryMobile?.message} isTyping={typingField === 'primaryMobile'}>
          <input
            type="tel"
            autoComplete="tel"
            placeholder="9876543210"
            {...registerWithTyping('primaryMobile')}
            className={inputClassName}
          />
        </Field>

        <Field label="Secondary Mobile" error={errors.secondaryMobile?.message} isTyping={typingField === 'secondaryMobile'}>
          <input
            type="tel"
            autoComplete="tel"
            placeholder="9876543211"
            {...registerWithTyping('secondaryMobile')}
            className={inputClassName}
          />
        </Field>

        <Field label="Date of Birth" error={errors.dateOfBirth?.message} isTyping={typingField === 'dateOfBirth'}>
          <input
            type="date"
            {...registerWithTyping('dateOfBirth')}
            className={inputClassName}
          />
        </Field>

        <Field label="Place of Birth" error={errors.placeOfBirth?.message} isTyping={typingField === 'placeOfBirth'}>
          <input
            type="text"
            placeholder="City"
            {...registerWithTyping('placeOfBirth')}
            className={inputClassName}
          />
        </Field>

        <Field label="Current Address" error={errors.currentAddress?.message} isTyping={typingField === 'currentAddress'}>
          <textarea
            rows={3}
            placeholder="Current address"
            {...registerWithTyping('currentAddress')}
            className={`${inputClassName} h-24 resize-none py-3`}
          />
        </Field>

        <Field label="Permanent Address" error={errors.permanentAddress?.message} isTyping={typingField === 'permanentAddress'}>
          <textarea
            rows={3}
            placeholder="Permanent address"
            {...registerWithTyping('permanentAddress')}
            className={`${inputClassName} h-24 resize-none py-3`}
          />
        </Field>

        <Field label="PAN" error={errors.pan?.message} isTyping={typingField === 'pan'}>
          <input
            type="text"
            autoComplete="off"
            placeholder={isEditMode ? 'Leave blank to keep existing PAN' : 'ABCDE1234F'}
            {...registerWithTyping('pan')}
            className={`${inputClassName} uppercase`}
          />
        </Field>

        <Field label="Aadhaar" error={errors.aadhaar?.message} isTyping={typingField === 'aadhaar'}>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder={isEditMode ? 'Leave blank to keep existing Aadhaar' : '123456789012'}
            {...registerWithTyping('aadhaar')}
            className={inputClassName}
          />
        </Field>
      </div>

      <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
        {isEditMode && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:text-slate-950 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitDisabled}
          className="rounded-md bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
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
  isTyping,
  children,
}: {
  label: string;
  error?: string;
  isTyping?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={`field-card ${isTyping ? 'field-card-active' : ''}`}>
      <span className="flex min-h-5 items-center justify-between gap-3 text-sm font-semibold text-slate-700">
        {label}
        {isTyping && (
          <span className="typing-indicator" aria-live="polite">
            Typing<span className="typing-dot">.</span><span className="typing-dot">.</span><span className="typing-dot">.</span>
          </span>
        )}
      </span>
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

function compactPayload(values: UserFormValues) {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== '')
  ) as UserFormValues;
}
