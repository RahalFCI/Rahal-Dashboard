import { apiClientNoContent } from '@/shared/api/client';

// Soft deletes a post. Explorers can only delete their own post (enforced
// server-side); Admins can delete any post. Returns 204 No Content on
// success - no response body, hence apiClientNoContent rather than apiClient.
export function deletePost(postId: string) {
  return apiClientNoContent({
    method: 'DELETE',
    url: `/Posts/${postId}`,
  });
}
