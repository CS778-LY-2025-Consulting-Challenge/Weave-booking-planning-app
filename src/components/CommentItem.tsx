'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  MessageCircle, 
  Edit2, 
  Trash2, 
  MoreVertical,
  Smile,
  Send,
  X,
  Loader2,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface CommentItemProps {
  comment: {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string | null;
    content: string;
    createdAt: string;
    updatedAt?: string;
  };
  currentUserId?: string;
  tripId: string;
  onUpdate: () => void;
  isReply?: boolean;
}

export function CommentItem({
  comment,
  currentUserId,
  tripId,
  onUpdate,
  isReply = false,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReplyEmojiPicker, setShowReplyEmojiPicker] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [replies, setReplies] = useState<any[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isOwner = currentUserId === comment.userId;

  const handleEdit = async () => {
    if (!editContent.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/community-trips/${tripId}/comments`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId: comment.id,
          content: editContent,
        }),
      });

      if (!response.ok) throw new Error('Failed to update comment');

      toast.success('Comment updated!');
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      setIsDeleting(true);
      const response = await fetch(
        `/api/community-trips/${tripId}/comments?commentId=${comment.id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete comment');

      toast.success('Comment deleted!');
      onUpdate();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLike = async () => {
    try {
      const response = await fetch(
        `/api/community-trips/${tripId}/comments/${comment.id}/like`,
        { method: 'POST' }
      );

      if (!response.ok) throw new Error('Failed to toggle like');

      const data = await response.json();
      setIsLiked(data.isLiked);
      setLikeCount(data.likeCount);
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const loadReplies = async () => {
    if (showReplies) {
      setShowReplies(false);
      return;
    }

    try {
      setLoadingReplies(true);
      const response = await fetch(
        `/api/community-trips/${tripId}/comments/${comment.id}/replies`
      );

      if (!response.ok) throw new Error('Failed to load replies');

      const data = await response.json();
      setReplies(data);
      setShowReplies(true);
    } catch (error) {
      console.error('Error loading replies:', error);
      toast.error('Failed to load replies');
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(
        `/api/community-trips/${tripId}/comments/${comment.id}/replies`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: replyContent,
            userName: comment.userName,
            userAvatar: comment.userAvatar,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to post reply');

      toast.success('Reply posted!');
      setReplyContent('');
      setIsReplying(false);
      loadReplies();
      onUpdate();
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={cn('space-y-3', isReply && 'ml-12')}>
      <div className="flex gap-3 group">
        <Avatar className="size-10 shrink-0">
          <AvatarImage src={comment.userAvatar || undefined} />
          <AvatarFallback>
            <User className="size-5" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          {/* Comment Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-zinc-800">
                {comment.userName}
              </span>
              <span className="text-xs text-zinc-500">
                {formatDate(comment.createdAt)}
              </span>
              {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                <span className="text-xs text-zinc-400 italic">(edited)</span>
              )}
            </div>

            {isOwner && !isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit2 className="size-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red-600"
                    disabled={isDeleting}
                  >
                    <Trash2 className="size-4 mr-2" />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Comment Content */}
          {isEditing ? (
            <div className="space-y-2">
              <div className="relative">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="resize-none pr-10"
                  rows={3}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="size-4" />
                </Button>
                {showEmojiPicker && (
                  <div className="absolute top-full right-0 z-50 mt-2">
                    <EmojiPicker
                      onEmojiClick={(emoji) => {
                        setEditContent(editContent + emoji.emoji);
                        setShowEmojiPicker(false);
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleEdit} disabled={submitting}>
                  {submitting ? <Loader2 className="size-4 animate-spin" /> : 'Save'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-50 rounded-lg p-3">
              <p className="text-zinc-700 whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {!isEditing && (
            <div className="flex items-center gap-4 text-sm">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-auto p-0 hover:bg-transparent',
                  isLiked && 'text-red-500'
                )}
                onClick={handleLike}
              >
                <Heart className={cn('size-4 mr-1', isLiked && 'fill-current')} />
                {likeCount > 0 && <span>{likeCount}</span>}
                <span className="ml-1">{isLiked ? 'Liked' : 'Like'}</span>
              </Button>

              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent text-zinc-600"
                  onClick={() => setIsReplying(!isReplying)}
                >
                  <MessageCircle className="size-4 mr-1" />
                  Reply
                </Button>
              )}

              {!isReply && replies.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent text-zinc-600"
                  onClick={loadReplies}
                  disabled={loadingReplies}
                >
                  {loadingReplies ? (
                    <Loader2 className="size-4 animate-spin mr-1" />
                  ) : (
                    <MessageCircle className="size-4 mr-1" />
                  )}
                  {showReplies ? 'Hide' : 'View'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                </Button>
              )}
            </div>
          )}

          {/* Reply Input */}
          {isReplying && (
            <div className="mt-3 space-y-2">
              <div className="relative">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="resize-none pr-10"
                  rows={2}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => setShowReplyEmojiPicker(!showReplyEmojiPicker)}
                >
                  <Smile className="size-4" />
                </Button>
                {showReplyEmojiPicker && (
                  <div className="absolute top-full right-0 z-50 mt-2">
                    <EmojiPicker
                      onEmojiClick={(emoji) => {
                        setReplyContent(replyContent + emoji.emoji);
                        setShowReplyEmojiPicker(false);
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleReply} disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="size-4 mr-2" />
                  )}
                  Reply
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent('');
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {showReplies && replies.length > 0 && (
        <div className="space-y-3">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              tripId={tripId}
              onUpdate={() => {
                loadReplies();
                onUpdate();
              }}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
}
