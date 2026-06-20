export interface UserResponse {
  id: number;
  name: string;
  email: string;
  primaryMobile: string;
  dateOfBirth: string;
  pan: string;
  aadhaar: string;
  active: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserCreateRequest {
  name: string;
  email: string;
  primaryMobile: string;
  dateOfBirth: string;
  pan: string;
  aadhaar: string;
}

export type UserUpdateRequest = Partial<UserCreateRequest>;

export interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface Pageable {
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  unpaged: boolean;
  sort: Sort;
}

export interface Page<T> {
  content: T[];
  pageable: Pageable;
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  size: number;
  number: number;
  sort: Sort;
  numberOfElements: number;
  empty: boolean;
}
