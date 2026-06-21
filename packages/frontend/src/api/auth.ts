import type { User } from '@pm-system/shared';
import client from './client';

export function login(
  email: string,
  password: string,
): Promise<{ accessToken: string; user: User }> {
  return client
    .post<{ accessToken: string; user: User }>('/auth/login', { email, password })
    .then((r) => r.data);
}

export function getMe(): Promise<User> {
  return client.get<User>('/auth/me').then((r) => r.data);
}
