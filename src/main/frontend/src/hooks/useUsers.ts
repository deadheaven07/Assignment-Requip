import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createUser, deleteUser, fetchUsers, updateUser } from '../api/api';
import type { UserCreateRequest, UserUpdateRequest } from '../api/types';

export function useGetUsers(page: number, size: number) {
  return useQuery({
    queryKey: ['users', page, size],
    queryFn: () => fetchUsers(page, size),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UserCreateRequest) => createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UserUpdateRequest }) => updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
