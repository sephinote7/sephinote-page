import { createServerSupabaseClient } from "@/lib/supabase-server";
import { MainLayout, ContentHeader } from "@/components/layout";
import PostGrid from "@/components/post/PostGrid";
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

async function getTotalCount(sort?: string): Promise<number> {
  const supabase = await createServerSupabaseClient();
  
  if (sort === "popular") {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { count } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true)
      .gte("created_at", sevenDaysAgo.toISOString());
    
    return count || 0;
  }
  
  const { count } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true);
  
  return count || 0;
}

export default async function HomePage({ searchParams }: PageProps) {
  const { sort } = await searchParams;
  const profile = await getProfile();
  const initialPosts = sort === "popular" ? await getPopularPosts() : await getLatestPosts();
  const totalCount = await getTotalCount(sort);

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

        {/* Posts Grid with Load More */}
        <PostGrid 
          initialPosts={initialPosts} 
          totalCount={totalCount}
          sortBy={sort}
        />
      </div>
    </MainLayout>
  );
}
