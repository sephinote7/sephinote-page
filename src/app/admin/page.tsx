import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { AdminLayout } from "@/components/layout";
import { StatCard, Card, CardContent, Stack, Grid, Badge, Button, Icon } from "@/components/ui";
import { stripMarkdown } from "@/lib/markdown";
import type { Profile, Post, Comment } from "@/types";

async function getProfileAndStats() {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { count: totalPosts } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("del_yn", "N");

  const { count: portfolioCount } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("category", "portfolio")
    .eq("del_yn", "N");

  const { count: foodCount } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("category", "food")
    .eq("del_yn", "N");

  const { count: drawingCount } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("category", "drawing")
    .eq("del_yn", "N");

  const { count: totalComments } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("del_yn", "N");

  const { data: recentPosts } = await supabase
    .from("posts")
    .select("*")
    .eq("del_yn", "N")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentComments } = await supabase
    .from("comments")
    .select(`
      *,
      posts:post_id (title)
    `)
    .eq("del_yn", "N")
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    profile: profile as Profile,
    stats: {
      totalPosts: totalPosts || 0,
      totalComments: totalComments || 0,
      portfolioPosts: portfolioCount || 0,
      foodPosts: foodCount || 0,
      drawingPosts: drawingCount || 0,
    },
    recentPosts: recentPosts as Post[],
    recentComments: recentComments?.map(c => ({
      ...c,
      postTitle: c.posts?.title || "Unknown Post"
    })) || [],
  };
}

function getInitialFromNickname(nickname: string): string {
  if (!nickname) return "?";
  const trimmed = nickname.trim();
  if (!trimmed) return "?";
  const firstChar = trimmed.charAt(0);
  // 한글은 그대로, 영문/숫자는 대문자로
  return /[a-zA-Z]/.test(firstChar) ? firstChar.toUpperCase() : firstChar;
}

const categoryColors: Record<Post["category"], "primary" | "success" | "secondary"> = {
  portfolio: "primary",
  food: "success",
  drawing: "secondary",
};

export default async function AdminDashboardPage() {
  const { profile, stats, recentPosts, recentComments } = await getProfileAndStats();

  return (
    <AdminLayout profile={profile}>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Dashboard
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Welcome back, {profile?.username || "Admin"}! Here&apos;s what&apos;s happening with your site.
          </p>
        </div>

        {/* Stats Grid */}
        <Grid cols={2} colsMd={3} colsLg={4} gap="md" className="mb-8">
          <StatCard
            label="Total Posts"
            value={stats.totalPosts}
            icon={<Icon name="bookmark" size="md" />}
          />
          <StatCard
            label="Total Comments"
            value={stats.totalComments}
            icon={<Icon name="chat" size="md" />}
          />
          <StatCard
            label="Portfolio"
            value={stats.portfolioPosts}
            icon={<Icon name="bookmark" size="md" />}
          />
          <StatCard
            label="Categories"
            value="3"
            icon={<Icon name="menu" size="md" />}
          />
        </Grid>

        {/* Category Stats */}
        <Card className="mb-8">
          <CardContent>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Posts by Category
            </h2>
            <Stack direction="row" gap="lg" wrap>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Portfolio: {stats.portfolioPosts}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Food: {stats.foodPosts}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Drawing: {stats.drawingPosts}
                </span>
              </div>
            </Stack>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <Grid cols={1} colsLg={2} gap="lg">
          {/* Recent Posts */}
          <Card>
            <CardContent>
              <Stack direction="row" justify="between" align="center" className="mb-4 flex-wrap gap-3">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Recent Posts
                </h2>
                <Stack direction="row" gap="sm" className="flex-wrap items-center">
                  <Link href="/admin/trash/posts">
                    <Button type="button" variant="ghost" size="sm" className="whitespace-nowrap">
                      삭제된 게시글
                    </Button>
                  </Link>
                  <Link href="/admin/posts">
                    <Button type="button" variant="outline" size="sm" className="whitespace-nowrap">
                      전체 보기
                    </Button>
                  </Link>
                  <Link href="/admin/write">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      className="whitespace-nowrap"
                      leftIcon={<Icon name="plus" size="sm" />}
                    >
                      New Post
                    </Button>
                  </Link>
                </Stack>
              </Stack>
              <div className="space-y-4">
                {recentPosts?.map((post) => (
                  <div
                    key={post.id}
                    className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
                  >
                    <Stack direction="row" gap="sm" align="center" className="mb-2 justify-between">
                      <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {post.title}
                      </p>
                      <Link href={`/posts/${post.id}`}>
                        <Button type="button" variant="ghost" size="icon" aria-label="게시글로 이동">
                          <Icon name="arrow-right" size="sm" />
                        </Button>
                      </Link>
                    </Stack>
                    <Stack direction="row" gap="sm" align="center" className="mb-2">
                      <Badge variant={categoryColors[post.category]} size="sm">
                        {post.category}
                      </Badge>
                      <span className="text-xs text-zinc-500">
                        {new Date(post.created_at).toLocaleDateString("ko-KR")}
                      </span>
                    </Stack>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {stripMarkdown(post.content || "")}
                    </p>
                  </div>
                ))}
                {(!recentPosts || recentPosts.length === 0) && (
                  <p className="text-center text-zinc-500 py-4">아직 게시글이 없습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Comments */}
          <Card>
            <CardContent>
              <Stack direction="row" justify="between" align="center" className="mb-4 flex-wrap gap-3">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Recent Comments
                </h2>
                <Stack direction="row" gap="sm" className="flex-wrap items-center">
                  <Link href="/admin/trash/comments">
                    <Button type="button" variant="ghost" size="sm" className="whitespace-nowrap">
                      삭제된 댓글
                    </Button>
                  </Link>
                  <Link href="/admin/comments">
                    <Button type="button" variant="outline" size="sm" className="whitespace-nowrap">
                      전체 보기
                    </Button>
                  </Link>
                </Stack>
              </Stack>
              <div className="space-y-4">
                {recentComments?.map((comment: Comment & { postTitle: string }) => (
                  <div
                    key={comment.id}
                    className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
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
                      <Link href={`/posts/${comment.post_id}#comment-${comment.id}`}>
                        <Button type="button" variant="ghost" size="icon" aria-label="댓글 위치로 이동">
                          <Icon name="arrow-right" size="sm" />
                        </Button>
                      </Link>
                    </Stack>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2 line-clamp-2">
                      {comment.content}
                    </p>
                    <p className="text-xs text-zinc-400">
                      on &ldquo;{comment.postTitle}&rdquo;
                    </p>
                  </div>
                ))}
                {(!recentComments || recentComments.length === 0) && (
                  <p className="text-center text-zinc-500 py-4">아직 댓글이 없습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </Grid>
      </div>
    </AdminLayout>
  );
}
