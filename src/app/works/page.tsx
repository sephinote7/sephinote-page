import { createServerSupabaseClient } from "@/lib/supabase-server";
import { MainLayout, ContentHeader } from "@/components/layout";
import { PostCard, PostGrid } from "@/components/post";
import { Stack, Badge } from "@/components/ui";
import type { Post, Profile } from "@/types";

async function getProfile(): Promise<Profile | null> {
  const supabase = await createServerSupabaseClient();
  
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .limit(1)
    .single();
  
  return data;
}

async function getPortfolioPosts(): Promise<Post[]> {
  const supabase = await createServerSupabaseClient();
  
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("category", "portfolio")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(9);
  
  return data || [];
}

async function getTotalCount(): Promise<number> {
  const supabase = await createServerSupabaseClient();
  
  const { count } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("category", "portfolio")
    .eq("is_published", true);
  
  return count || 0;
}

const techStack = [
  "React", "Next.js", "TypeScript", "Tailwind CSS", "Figma", "Supabase"
];

export default async function WorksPage() {
  const profile = await getProfile();
  const posts = await getPortfolioPosts();
  const totalCount = await getTotalCount();

  return (
    <MainLayout profile={profile}>
      <ContentHeader showSearch={false} />

      <div className="px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <Stack direction="row" align="center" gap="md" className="mb-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-zinc-100">
              Works & Projects
            </h1>
            <Badge variant="primary" size="lg">{totalCount}</Badge>
          </Stack>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mb-6">
            Selected projects showcasing my approach to design and development.
            Each piece represents a unique challenge and creative solution.
          </p>

          {/* Tech Stack */}
          <Stack direction="row" gap="sm" wrap className="mb-4">
            {techStack.map((tech) => (
              <Badge key={tech} variant="secondary" size="sm">
                {tech}
              </Badge>
            ))}
          </Stack>
        </div>

        {/* Featured Project */}
        {posts[0] && (
          <div className="mb-12">
            <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4">
              Featured Project
            </h2>
            <PostCard post={posts[0]} variant="featured" />
          </div>
        )}

        {/* All Projects with Infinite Scroll */}
        {totalCount > 1 && (
          <div>
            <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4">
              All Projects
            </h2>
            <PostGrid 
              initialPosts={posts.slice(1)} 
              totalCount={totalCount - 1}
              category="portfolio"
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
}
