"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { MainLayout, ContentHeader } from "@/components/layout";
import { PostCard } from "@/components/post";
import { Stack, Grid, Button, Icon } from "@/components/ui";
import type { Post, Profile } from "@/types";

export default function LifePage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (categoryParam === "food" || categoryParam === "drawing") {
      setActiveCategory(categoryParam);
    } else {
      setActiveCategory("all");
    }
  }, [categoryParam]);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .limit(1)
        .single();
      
      setProfile(profileData);

      const query = supabase
        .from("posts")
        .select("*")
        .in("category", ["food", "drawing"])
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      const { data: postsData } = await query;
      setPosts(postsData || []);
      setIsLoading(false);
    }

    loadData();
  }, []);

  const filteredPosts =
    activeCategory === "all"
      ? posts
      : posts.filter((post) => post.category === activeCategory);

  const foodCount = posts.filter((p) => p.category === "food").length;
  const drawingCount = posts.filter((p) => p.category === "drawing").length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <MainLayout profile={profile}>
      <ContentHeader showSearch={true} />

      <div className="px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Life & Daily
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-xl">
            일상 속 작은 발견들. 맛있는 음식과 손으로 그린 그림들을 기록합니다.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mb-8">
          <Stack direction="row" gap="sm" wrap>
            <button
              onClick={() => setActiveCategory("all")}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${
                  activeCategory === "all"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }
              `}
            >
              All ({posts.length})
            </button>
            <button
              onClick={() => setActiveCategory("food")}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${
                  activeCategory === "food"
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }
              `}
            >
              <span className="mr-1">🍴</span> Food ({foodCount})
            </button>
            <button
              onClick={() => setActiveCategory("drawing")}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${
                  activeCategory === "drawing"
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }
              `}
            >
              <span className="mr-1">🎨</span> Drawing ({drawingCount})
            </button>
          </Stack>
        </div>

        {/* Posts Grid */}
        <Grid cols={1} colsMd={2} colsLg={3} gap="lg">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} variant="featured" />
          ))}
        </Grid>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <Icon name="bookmark" size="xl" className="text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-500 dark:text-zinc-400">
              아직 등록된 게시글이 없습니다.
            </p>
          </div>
        )}

        {/* Load More */}
        {filteredPosts.length > 6 && (
          <Stack align="center" className="mt-12">
            <Button
              variant="outline"
              size="lg"
              rightIcon={<Icon name="arrow-down" size="sm" />}
            >
              Load More
            </Button>
          </Stack>
        )}
      </div>
    </MainLayout>
  );
}
