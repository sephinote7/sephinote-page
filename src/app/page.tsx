import { createServerSupabaseClient } from "@/lib/supabase-server";
import { MainLayout, ContentHeader } from "@/components/layout";
import { PostCard } from "@/components/post";
import { Stack, Grid, Button, Icon } from "@/components/ui";
import type { Post, Profile } from "@/types";

interface PageProps {
  searchParams: Promise<{ sort?: string }>;
}

async function getProfile(): Promise<Profile | null> {
  const supabase = await createServerSupabaseClient();
  
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .limit(1)
    .single();
  
  return data;
}

async function getLatestPosts(): Promise<Post[]> {
  const supabase = await createServerSupabaseClient();
  
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(9);
  
  return data || [];
}

async function getPopularPosts(): Promise<Post[]> {
  const supabase = await createServerSupabaseClient();
  
  // 7일 이내 게시물 중 조회수 순으로 정렬
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("is_published", true)
    .gte("created_at", sevenDaysAgo.toISOString())
    .order("view_count", { ascending: false })
    .limit(9);
  
  return data || [];
}

export default async function HomePage({ searchParams }: PageProps) {
  const { sort } = await searchParams;
  const profile = await getProfile();
  const posts = sort === "popular" ? await getPopularPosts() : await getLatestPosts();

  return (
    <MainLayout profile={profile}>
      <ContentHeader />

      <div className="px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Curated Thoughts & Digital
            <br />
            Experiences
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-xl">
            {profile?.bio || "Exploring the intersection of minimal aesthetics and high-performance engineering."}
          </p>
        </div>

        {/* Posts Grid */}
        <Grid cols={1} colsMd={2} colsLg={3} gap="lg">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} variant="featured" />
          ))}
        </Grid>

        {/* Empty State */}
        {posts.length === 0 && (
          <div className="text-center py-16">
            <Icon name="bookmark" size="xl" className="text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-500 dark:text-zinc-400">
              아직 등록된 게시글이 없습니다.
            </p>
          </div>
        )}

        {/* Load More */}
        {posts.length > 0 && (
          <Stack align="center" className="mt-12">
            <Button
              variant="outline"
              size="lg"
              rightIcon={<Icon name="arrow-down" size="sm" />}
            >
              Load More Entries
            </Button>
          </Stack>
        )}
      </div>
    </MainLayout>
  );
}
