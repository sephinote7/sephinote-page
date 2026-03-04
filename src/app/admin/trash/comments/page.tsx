import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { AdminLayout } from "@/components/layout";
import { Card, CardContent, Stack, Grid, Badge, Button, Icon } from "@/components/ui";
import type { Profile, Comment } from "@/types";
import RestoreCommentButton from "@/components/admin/RestoreCommentButton";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

const PAGE_SIZE = 20;

async function getProfileAndDeletedComments(page: number) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: comments, count } = await supabase
    .from("comments")
    .select(
      `
      *,
      posts:post_id (title)
    `,
      { count: "exact" }
    )
    .eq("del_yn", "Y")
    .order("created_at", { ascending: false })
    .range(from, to);

  const mapped =
    comments?.map((c) => ({
      ...(c as any),
      postTitle: (c as any).posts?.title || "Unknown Post",
    })) || [];

  return {
    profile: profile as Profile,
    comments: mapped as (Comment & { postTitle: string })[],
    totalCount: count || 0,
  };
}

function getInitialFromNickname(nickname: string): string {
  if (!nickname) return "?";
  const trimmed = nickname.trim();
  if (!trimmed) return "?";
  const firstChar = trimmed.charAt(0);
  return /[a-zA-Z]/.test(firstChar) ? firstChar.toUpperCase() : firstChar;
}

export default async function AdminDeletedCommentsPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const { profile, comments, totalCount } = await getProfileAndDeletedComments(page);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <AdminLayout profile={profile}>
      <div className="p-6 lg:p-8">
        <Stack direction="row" justify="between" align="center" className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            삭제된 댓글
          </h1>
          <Link href="/admin/comments">
            <Button variant="outline" size="sm" leftIcon={<Icon name="arrow-left" size="sm" />}>
              댓글 목록으로
            </Button>
          </Link>
        </Stack>

        <Card className="mb-6">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-zinc-500">
                총 {totalCount}개의 삭제된 댓글 · 페이지 {page}/{totalPages}
              </span>
            </div>

            {comments.length === 0 ? (
              <p className="text-center text-zinc-500 py-8">삭제된 댓글이 없습니다.</p>
            ) : (
              <Grid cols={1} gap="sm">
                {comments.map((comment, index) => (
                  <div
                    key={comment.id}
                    className={`p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 ${
                      index >= 10 ? "hidden md:block" : ""
                    }`}
                  >
                    <Stack direction="row" gap="sm" align="center" className="mb-2 justify-between">
                      <Stack direction="row" gap="sm" align="center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400">
                          {getInitialFromNickname(comment.nickname)}
                        </div>
                        <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                          {comment.nickname}
                        </span>
                        {comment.is_admin && (
                          <Badge variant="primary" size="sm">Admin</Badge>
                        )}
                        <span className="text-xs text-zinc-500">
                          {new Date(comment.created_at).toLocaleDateString("ko-KR")}
                        </span>
                      </Stack>
                      <Stack direction="row" gap="sm">
                        <RestoreCommentButton commentId={comment.id} />
                        <Link href={`/posts/${comment.post_id}#comment-${comment.id}`}>
                          <Button variant="ghost" size="icon">
                            <Icon name="arrow-right" size="sm" />
                          </Button>
                        </Link>
                      </Stack>
                    </Stack>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                      {comment.content}
                    </p>
                    <p className="text-xs text-zinc-400">
                      on &ldquo;{comment.postTitle}&rdquo;
                    </p>
                  </div>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>

        <Stack direction="row" justify="center" gap="sm">
          <Link href={`/admin/trash/comments?page=${page - 1}`} aria-disabled={page <= 1}>
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
            >
              이전
            </Button>
          </Link>
          <Link href={`/admin/trash/comments?page=${page + 1}`} aria-disabled={page >= totalPages}>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
            >
              다음
            </Button>
          </Link>
        </Stack>
      </div>
    </AdminLayout>
  );
}

