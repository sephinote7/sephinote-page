"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { Stack, Button, Input, Textarea, Badge, Divider } from "@/components/ui";
import type { Comment, Profile } from "@/types";

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  profile?: Profile | null;
}

interface CommentAvatarProps {
  nickname: string;
  isAdmin: boolean;
  adminAvatarUrl?: string | null;
  size?: "sm" | "md";
}

function CommentAvatar({ nickname, isAdmin, adminAvatarUrl, size = "md" }: CommentAvatarProps) {
  const firstChar = nickname.charAt(0).toUpperCase();
  const sizeClass = size === "sm" ? "w-8 h-8 text-sm" : "w-10 h-10 text-base";

  if (isAdmin && adminAvatarUrl) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden shrink-0 relative`}>
        <Image src={adminAvatarUrl} alt="Admin" fill className="object-cover" />
      </div>
    );
  }

  return (
    <div className={`${sizeClass} rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0`}>
      <span className="font-medium text-blue-600 dark:text-blue-400">{firstChar}</span>
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  replies: Comment[];
  adminAvatarUrl?: string | null;
  isLoggedIn: boolean;
  onSubmitReply: (parentId: string, content: string, nickname: string, password: string) => Promise<void>;
}

function CommentItem({ comment, replies, adminAvatarUrl, isLoggedIn, onSubmitReply }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyNickname, setReplyNickname] = useState("");
  const [replyPassword, setReplyPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return;
    if (!isLoggedIn && (!replyNickname.trim() || !replyPassword.trim())) return;

    setIsSubmitting(true);
    await onSubmitReply(
      comment.id, 
      replyContent, 
      isLoggedIn ? "Admin" : replyNickname, 
      replyPassword
    );
    setIsSubmitting(false);
    setReplyContent("");
    setReplyNickname("");
    setReplyPassword("");
    setShowReplyForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <CommentAvatar 
          nickname={comment.nickname} 
          isAdmin={comment.is_admin}
          adminAvatarUrl={adminAvatarUrl}
        />
        <div className="flex-1 min-w-0">
          <Stack direction="row" align="center" gap="sm" className="mb-1">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {comment.nickname}
            </span>
            {comment.is_admin && (
              <Badge variant="primary" size="sm">Admin</Badge>
            )}
            <span className="text-xs text-zinc-400">
              {new Date(comment.created_at).toLocaleDateString("ko-KR")}
            </span>
          </Stack>
          <p className="text-zinc-600 dark:text-zinc-400 mb-2 wrap-break-word">{comment.content}</p>
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Reply
          </button>

          {showReplyForm && (
            <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
              <Textarea 
                placeholder="답글을 작성하세요..." 
                rows={2} 
                className="mb-3" 
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
              {!isLoggedIn && (
                <Stack direction="row" gap="sm" className="mb-3">
                  <Input 
                    placeholder="닉네임" 
                    className="w-32" 
                    value={replyNickname}
                    onChange={(e) => setReplyNickname(e.target.value)}
                  />
                  <Input 
                    type="password" 
                    placeholder="비밀번호" 
                    className="w-32" 
                    value={replyPassword}
                    onChange={(e) => setReplyPassword(e.target.value)}
                  />
                </Stack>
              )}
              <Stack direction="row" gap="sm" justify="end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowReplyForm(false)}
                >
                  취소
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={handleSubmitReply}
                  disabled={isSubmitting || !replyContent.trim() || (!isLoggedIn && (!replyNickname.trim() || !replyPassword.trim()))}
                  isLoading={isSubmitting}
                >
                  등록
                </Button>
              </Stack>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="ml-12 pl-4 border-l-2 border-zinc-200 dark:border-zinc-700 space-y-4">
          {replies.map((reply) => (
            <div key={reply.id} className="flex gap-3">
              <CommentAvatar 
                nickname={reply.nickname} 
                isAdmin={reply.is_admin}
                adminAvatarUrl={adminAvatarUrl}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <Stack direction="row" align="center" gap="sm" className="mb-1">
                  <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                    {reply.nickname}
                  </span>
                  {reply.is_admin && (
                    <Badge variant="primary" size="sm">Admin</Badge>
                  )}
                  <span className="text-xs text-zinc-400">
                    {new Date(reply.created_at).toLocaleDateString("ko-KR")}
                  </span>
                </Stack>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 wrap-break-word">{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentSection({ postId, comments: initialComments, profile }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    }
    checkAuth();
  }, [supabase]);

  const rootComments = comments.filter((c) => !c.parent_id);
  const getReplies = (parentId: string) =>
    comments.filter((c) => c.parent_id === parentId);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    if (!isLoggedIn && (!nickname.trim() || !password.trim())) return;

    setIsSubmitting(true);

    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        content: newComment,
        nickname: isLoggedIn ? (profile?.username || "Admin") : nickname,
        password: isLoggedIn ? null : password,
        is_admin: isLoggedIn,
      })
      .select()
      .single();

    if (!error && data) {
      setComments([...comments, data]);
      setNewComment("");
      setNickname("");
      setPassword("");
    }

    setIsSubmitting(false);
  };

  const handleSubmitReply = async (parentId: string, content: string, replyNickname: string, replyPassword: string) => {
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        parent_id: parentId,
        content,
        nickname: replyNickname,
        password: isLoggedIn ? null : replyPassword,
        is_admin: isLoggedIn,
      })
      .select()
      .single();

    if (!error && data) {
      setComments([...comments, data]);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        Comments ({comments.length})
      </h3>

      {/* New Comment Form */}
      <div className="mb-8 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
        <Textarea 
          placeholder="댓글을 작성하세요..." 
          rows={3} 
          className="mb-3" 
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Stack direction="row" gap="sm" justify="between" align="center" wrap>
          {!isLoggedIn ? (
            <Stack direction="row" gap="sm">
              <Input 
                placeholder="닉네임" 
                className="w-32" 
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              <Input 
                type="password" 
                placeholder="비밀번호 (삭제용)" 
                className="w-40" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Stack>
          ) : (
            <p className="text-sm text-zinc-500">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{profile?.username || "Admin"}</span>으로 작성
            </p>
          )}
          <Button 
            variant="primary" 
            onClick={handleSubmitComment}
            disabled={isSubmitting || !newComment.trim() || (!isLoggedIn && (!nickname.trim() || !password.trim()))}
            isLoading={isSubmitting}
          >
            댓글 등록
          </Button>
        </Stack>
      </div>

      <Divider className="mb-6" />

      {/* Comments List */}
      <div className="space-y-6">
        {rootComments.length > 0 ? (
          rootComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={getReplies(comment.id)}
              adminAvatarUrl={profile?.avatar_url}
              isLoggedIn={isLoggedIn}
              onSubmitReply={handleSubmitReply}
            />
          ))
        ) : (
          <div className="text-center py-8 text-zinc-400">
            아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
          </div>
        )}
      </div>
    </div>
  );
}
