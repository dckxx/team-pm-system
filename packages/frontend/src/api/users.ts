import type { User } from '@pm-system/shared';
import client from './client';

export function getUsers(): Promise<User[]> {
  return client.get<{ data: User[] }>('/users').then((r) => r.data.data);
}

export function getUserById(id: string): Promise<User> {
  return client
    .get<{ data: User }>(`/users/${id}`)
    .then((r) => r.data.data);
}

export function updateUser(
  id: string,
  data: Partial<Pick<User, 'role' | 'devRoles' | 'isActive' | 'name' | 'email' | 'avatarUrl'>>,
): Promise<User> {
  return client
    .patch<{ data: User }>(`/users/${id}`, data)
    .then((r) => r.data.data);
}
