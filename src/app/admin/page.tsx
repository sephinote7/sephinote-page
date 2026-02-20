import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { AdminLayout } from "@/components/layout";
import { StatCard, Card, CardContent, Stack, Grid, Badge, Button, Icon, Avatar } from "@/components/ui";
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
    .select("*", { count: "exact", head: true });

  const { count: portfolioCount } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("category", "portfolio");

  const { count: foodCount } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("category", "food");

  const { count: drawingCount } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("category", "drawing");

  const { count: totalComments } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true });

  const { data: recentPosts } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentComments } = await supabase
    .from("comments")
    .select(`
      *,
      posts:post_id (title)
    `)
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
              <Stack direction="row" justify="between" align="center" className="mb-4">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Recent Posts
                </h2>
                <Link href="/admin/write">
                  <Button variant="primary" size="sm" leftIcon={<Icon name="plus" size="sm" />}>
                    New Post
                  </Button>
                </Link>
              </Stack>
              <div className="space-y-4">
                {recentPosts?.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                      <Icon name="bookmark" size="sm" className="text-zinc-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {post.title}
                      </p>
                      <Stack direction="row" gap="sm" align="center">
                        <Badge variant={categoryColors[post.category]} size="sm">
                          {post.category}
                        </Badge>
                        <span className="text-xs text-zinc-500">
                          {new Date(post.created_at).toLocaleDateString("ko-KR")}
                        </span>
                      </Stack>
                    </div>
                    <Link href={`/admin/edit/${post.id}`}>
                      <Button variant="ghost" size="icon">
                        <Icon name="arrow-right" size="sm" />
                      </Button>
                    </Link>
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
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                Recent Comments
              </h2>
              <div className="space-y-4">
                {recentComments?.map((comment: Comment & { postTitle: string }) => (
                  <div
                    key={comment.id}
                    className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
                  >
                    <Stack direction="row" gap="sm" align="center" className="mb-2">
                      <Avatar className="w-8 h-8" />
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
