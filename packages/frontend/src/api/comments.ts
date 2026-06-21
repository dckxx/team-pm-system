import type { Comment } from '@pm-system/shared';
import client from './client';

export function getComments(requirementId: string): Promise<Comment[]> {
  return client
    .get<{ data: Comment[] }>(`/requirements/${requirementId}/comments`)
    .then((r) => r.data.data);
}

export function createComment(
  requirementId: string,
  content: string,
): Promise<Comment> {
  return client
    .post<{ data: Comment }>(`/requirements/${requirementId}/comments`, { content })
    .then((r) => r.data.data);
}

export function deleteComment(id: string): Promise<void> {
  return client.delete(`/comments/${id}`);
}
