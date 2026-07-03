import { MessageSquareOff, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/shared/layout/PageHeader';
import { deleteComment } from '../api/commentsApi';
import { deletePost } from '../api/postsApi';
import { DeleteByIdCard } from '../components/DeleteByIdCard';

// GET /api/posts/{id} and GET /api/posts/{postId}/comments are Explorer-only
// server-side, so there is no way for an admin session to fetch/preview a
// post or comment before deleting it - these cards only wrap the DELETE
// endpoints. The id has to come from elsewhere (a report, a support ticket,
// etc).
export function ContentModerationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Content moderation"
        description="Remove a post or comment by its ID - for example one flagged in a report or support ticket. There is no admin content feed to browse yet."
      />

      <div className="mx-auto max-w-xl space-y-6">
        <DeleteByIdCard
          icon={<ShieldAlert size={18} className="text-primary" />}
          heading="Delete a post"
          idInputId="post-id"
          idLabel="Post ID"
          deleteFn={deletePost}
          submitLabel="Delete post"
          confirmTitle="Delete this post?"
          confirmDescription="This soft-deletes the post - it disappears from feeds, likes, and comments immediately. This cannot be undone from this screen."
          successMessage={(id) => `Post ${id} was deleted.`}
        />

        <DeleteByIdCard
          icon={<MessageSquareOff size={18} className="text-primary" />}
          heading="Delete a comment"
          idInputId="comment-id"
          idLabel="Comment ID"
          deleteFn={deleteComment}
          submitLabel="Delete comment"
          confirmTitle="Delete this comment?"
          confirmDescription="This soft-deletes the comment - its child replies remain intact and visible. This cannot be undone from this screen."
          successMessage={(id) => `Comment ${id} was deleted.`}
        />
      </div>
    </>
  );
}
