import { apiClientNoContent } from '@/shared/api/client';

// Soft deletes a comment; child replies remain intact. Explorers can only
// delete their own comment (enforced server-side); Admins can delete any
// comment. Returns 204 No Content on success - route is a top-level
// "~/api/comments/{commentId}" override on PostsController, not nested under
// /Posts.
export function deleteComment(commentId: string) {
  return apiClientNoContent({
    method: 'DELETE',
    url: `/comments/${commentId}`,
  });
}
