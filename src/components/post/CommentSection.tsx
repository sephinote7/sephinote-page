"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { Stack, Button, Input, Textarea, Badge, Divider, Icon } from "@/components/ui";
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
  adminUsername?: string;
  isLoggedIn: boolean;
  onSubmitReply: (parentId: string, content: string, nickname: string, password: string) => Promise<void>;
  onEditComment: (comment: Comment) => Promise<void>;
  onDeleteComment: (comment: Comment) => Promise<void>;
}

function CommentItem({
  comment,
  replies,
  adminAvatarUrl,
  adminUsername,
  isLoggedIn,
  onSubmitReply,
  onEditComment,
  onDeleteComment,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyNickname, setReplyNickname] = useState("");
  const [replyPassword, setReplyPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDeleted = comment.del_yn === "Y";

  const handleSubmitReply = async () => {
    if (isDeleted) return;
    if (!replyContent.trim()) return;
    if (!isLoggedIn && (!replyNickname.trim() || !replyPassword.trim())) return;

    setIsSubmitting(true);
    await onSubmitReply(
      comment.id, 
      replyContent, 
      isLoggedIn ? (adminUsername || "Admin") : replyNickname, 
      replyPassword
    );
    setIsSubmitting(false);
    setReplyContent("");
    setReplyNickname("");
    setReplyPassword("");
    setShowReplyForm(false);
  };

  return (
    <div className="space-y-4" id={`comment-${comment.id}`}>
      <div className="flex gap-3 group">
        <CommentAvatar 
          nickname={comment.nickname} 
          isAdmin={comment.is_admin}
          adminAvatarUrl={adminAvatarUrl}
        />
        <div className="flex-1 min-w-0">
          <Stack direction="row" align="center" gap="sm" className="mb-1 justify-between">
            <Stack direction="row" align="center" gap="sm">
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
            {!isDeleted && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => onEditComment(comment)}
                  className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  aria-label="댓글 수정"
                >
                  <Icon name="settings" size="xs" className="text-zinc-400" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteComment(comment)}
                  className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                  aria-label="댓글 삭제"
                >
                  <Icon name="close" size="xs" className="text-red-500" />
                </button>
              </div>
            )}
          </Stack>
          <p
            className={`mb-2 wrap-break-word ${
              isDeleted ? "text-zinc-400 dark:text-zinc-500 italic" : "text-zinc-600 dark:text-zinc-400"
            }`}
          >
            {isDeleted ? "삭제된 댓글입니다." : comment.content}
          </p>
          {!isDeleted && (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="ml-12 pl-4 border-l-2 border-zinc-200 dark:border-zinc-700 space-y-4">
          {replies.map((reply) => {
            const replyDeleted = reply.del_yn === "Y";
            return (
              <div key={reply.id} id={`comment-${reply.id}`} className="flex gap-3 group">
                <CommentAvatar 
                  nickname={reply.nickname} 
                  isAdmin={reply.is_admin}
                  adminAvatarUrl={adminAvatarUrl}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <Stack direction="row" align="center" gap="sm" className="mb-1 justify-between">
                    <Stack direction="row" align="center" gap="sm">
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
                    {!replyDeleted && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => onEditComment(reply)}
                          className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          aria-label="대댓글 수정"
                        >
                          <Icon name="settings" size="xs" className="text-zinc-400" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteComment(reply)}
                          className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                          aria-label="대댓글 삭제"
                        >
                          <Icon name="close" size="xs" className="text-red-500" />
                        </button>
                      </div>
                    )}
                  </Stack>
                  <p
                    className={`text-sm wrap-break-word ${
                      replyDeleted ? "text-zinc-400 dark:text-zinc-500 italic" : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {replyDeleted ? "삭제된 댓글입니다." : reply.content}
                  </p>
                </div>
              </div>
            );
          })}
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
  const [isProcessingComment, setIsProcessingComment] = useState(false);

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

  const handleEditComment = async (comment: Comment) => {
    if (comment.del_yn === "Y") return;
    const currentContent = comment.content || "";
    const newContent = window.prompt("수정할 내용을 입력하세요.", currentContent);

    if (!newContent || newContent.trim() === currentContent.trim()) {
      return;
    }

    let passwordToCheck: string | null = null;

    // 관리자 로그인 시에는 비밀번호 없이 수정 가능
    if (!isLoggedIn) {
      if (!comment.is_admin) {
        passwordToCheck = window.prompt("댓글 작성 시 입력한 비밀번호를 입력하세요.") ?? null;
        if (!passwordToCheck) return;
      }
    }

    setIsProcessingComment(true);

    let query = supabase
      .from("comments")
      .update({ content: newContent.trim() })
      .eq("id", comment.id);

    if (!isLoggedIn && !comment.is_admin && passwordToCheck) {
      query = query.eq("password", passwordToCheck);
    }

    const { data, error } = await query.select().single();

    if (error || !data) {
      console.error(error);
      alert("댓글 수정에 실패했거나 비밀번호가 일치하지 않습니다.");
      setIsProcessingComment(false);
      return;
    }

    setComments((prev) => prev.map((c) => (c.id === comment.id ? (data as Comment) : c)));
    setIsProcessingComment(false);
  };

  const handleDeleteComment = async (comment: Comment) => {
    if (comment.del_yn === "Y") return;
    let passwordToCheck: string | null = null;

    // 관리자 로그인 시에는 비밀번호 없이 삭제 가능
    if (!isLoggedIn) {
      if (!comment.is_admin) {
        passwordToCheck = window.prompt("댓글 작성 시 입력한 비밀번호를 입력하세요.") ?? null;
        if (!passwordToCheck) return;
      }
    }

    const confirmed = window.confirm("이 댓글을 삭제하시겠습니까?");
    if (!confirmed) return;

    setIsProcessingComment(true);

    let query = supabase
      .from("comments")
      .update({ del_yn: "Y" })
      .eq("id", comment.id);

    if (!isLoggedIn && !comment.is_admin && passwordToCheck) {
      query = query.eq("password", passwordToCheck);
    }

    const { data, error } = await query.select().single();

    if (error || !data) {
      console.error(error);
      alert("댓글 삭제에 실패했거나 비밀번호가 일치하지 않습니다.");
      setIsProcessingComment(false);
      return;
    }

    // 루트 댓글 삭제 시 해당 댓글은 루프에서 빠지므로 대댓글도 함께 보이지 않게 됨
    setComments((prev) => prev.filter((c) => c.id !== comment.id));
    setIsProcessingComment(false);
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
              adminUsername={profile?.username}
              isLoggedIn={isLoggedIn}
              onSubmitReply={handleSubmitReply}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
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
