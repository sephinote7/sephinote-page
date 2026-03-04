import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { AdminLayout } from "@/components/layout";
import { Card, CardContent, Stack, Grid, Badge, Button, Icon } from "@/components/ui";
import type { Profile, Post } from "@/types";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

const PAGE_SIZE = 20;

async function getProfileAndPosts(page: number) {
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

  const { data: posts, count } = await supabase
    .from("posts")
    .select("*", { count: "exact" })
    .eq("del_yn", "N")
    .order("created_at", { ascending: false })
    .range(from, to);

  return {
    profile: profile as Profile,
    posts: (posts as Post[]) || [],
    totalCount: count || 0,
  };
}

export default async function AdminPostsListPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const { profile, posts, totalCount } = await getProfileAndPosts(page);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <AdminLayout profile={profile}>
      <div className="p-6 lg:p-8">
        <Stack direction="row" justify="between" align="center" className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Posts
          </h1>
          <Link href="/admin/write">
            <Button variant="primary" size="sm" leftIcon={<Icon name="plus" size="sm" />}>
              New Post
            </Button>
          </Link>
        </Stack>

        <Card className="mb-6">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-zinc-500">
                총 {totalCount}개의 게시글 · 페이지 {page}/{totalPages}
              </span>
            </div>

            {posts.length === 0 ? (
              <p className="text-center text-zinc-500 py-8">등록된 게시글이 없습니다.</p>
            ) : (
              <Grid cols={1} gap="sm">
                {posts.map((post, index) => (
                  <div
                    key={post.id}
                    className={`flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${
                      index >= 10 ? "hidden md:flex" : ""
                    }`}
                  >
                    <div className="w-10 h-10 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                      <Icon name="bookmark" size="sm" className="text-zinc-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {post.title}
                      </p>
                      <Stack direction="row" gap="sm" align="center">
                        <Badge
                          variant={
                            post.category === "portfolio"
                              ? "primary"
                              : post.category === "food"
                              ? "success"
                              : "secondary"
                          }
                          size="sm"
                        >
                          {post.category}
                        </Badge>
                        <span className="text-xs text-zinc-500">
                          {new Date(post.created_at).toLocaleDateString("ko-KR")}
                        </span>
                      </Stack>
                    </div>
                    <Stack direction="row" gap="sm">
                      <Link href={`/posts/${post.id}`}>
                        <Button variant="ghost" size="icon">
                          <Icon name="arrow-right" size="sm" />
                        </Button>
                      </Link>
                      <Link href={`/admin/edit/${post.id}`}>
                        <Button variant="outline" size="icon">
                          <Icon name="settings" size="sm" />
                        </Button>
                      </Link>
                    </Stack>
                  </div>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>

        <Stack direction="row" justify="center" gap="sm">
          <Link href={`/admin/posts?page=${page - 1}`} aria-disabled={page <= 1}>
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
            >
              이전
            </Button>
          </Link>
          <Link href={`/admin/posts?page=${page + 1}`} aria-disabled={page >= totalPages}>
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

