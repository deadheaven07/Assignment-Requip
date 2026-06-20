import axios from 'axios';

import type { Page, UserCreateRequest, UserResponse, UserUpdateRequest } from './types';

const usersApi = axios.create({
  baseURL: import.meta.env.VITE_USERS_API_URL ?? 'http://localhost:8081/api/v1/users',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function fetchUsers(page: number, size: number): Promise<Page<UserResponse>> {
  const response = await usersApi.get<Page<UserResponse>>('', {
    params: {
      page,
      size,
    },
  });

  return response.data;
}

export async function createUser(payload: UserCreateRequest): Promise<UserResponse> {
  const response = await usersApi.post<UserResponse>('', payload);
  return response.data;
}

export async function updateUser(id: number, payload: UserUpdateRequest): Promise<UserResponse> {
  const response = await usersApi.put<UserResponse>(`/${id}`, payload);
  return response.data;
}

export async function deleteUser(id: number): Promise<void> {
  await usersApi.delete(`/${id}`);
}
