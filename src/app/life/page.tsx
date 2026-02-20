"use client";

import { Suspense, useState, useEffect, useRef, useCallback, startTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { MainLayout, ContentHeader } from "@/components/layout";
import { PostCard } from "@/components/post";
import { Stack, Grid, Icon } from "@/components/ui";
import type { Post, Profile } from "@/types";

const PAGE_SIZE = 9;

function LifePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get("category");
  const initialCategory = categoryParam === "food" || categoryParam === "drawing" ? categoryParam : "all";
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [offset, setOffset] = useState(PAGE_SIZE);
  const loaderRef = useRef<HTMLDivElement>(null);
  const isFirstMount = useRef(true);
  
  const supabase = createClient();

  const handleCategoryChange = useCallback((category: string) => {
    if (category === activeCategory) return;
    setActiveCategory(category);
    startTransition(() => {
      const url = category === "all" ? "/life" : `/life?category=${category}`;
      router.replace(url, { scroll: false });
    });
  }, [router, activeCategory]);

  useEffect(() => {
    async function loadProfile() {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .limit(1)
        .single();
      setProfile(profileData);
    }
    loadProfile();
  }, [supabase]);

  const loadPosts = useCallback(async (category: string, showInitialLoading: boolean) => {
    if (showInitialLoading) {
      setIsInitialLoading(true);
    }

    let query = supabase
      .from("posts")
      .select("*")
      .in("category", ["food", "drawing"])
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (category !== "all") {
      query = supabase
        .from("posts")
        .select("*")
        .eq("category", category)
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);
    }

    const { data: postsData } = await query;
    setPosts(postsData || []);

    let countQuery = supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .in("category", ["food", "drawing"])
      .eq("is_published", true);

    if (category !== "all") {
      countQuery = supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("category", category)
        .eq("is_published", true);
    }

    const { count } = await countQuery;
    setTotalCount(count || 0);
    setOffset(PAGE_SIZE);
    setIsInitialLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      loadPosts(activeCategory, true);
    }
  }, [activeCategory, loadPosts]);

  useEffect(() => {
    if (!isFirstMount.current) {
      loadPosts(activeCategory, false);
    }
  }, [activeCategory, loadPosts]);

  useEffect(() => {
    const newCategory = categoryParam === "food" || categoryParam === "drawing" ? categoryParam : "all";
    if (newCategory !== activeCategory) {
      setActiveCategory(newCategory);
    }
  }, [categoryParam, activeCategory]);

  const hasMore = posts.length < totalCount;

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    let query = supabase
      .from("posts")
      .select("*")
      .in("category", ["food", "drawing"])
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (activeCategory !== "all") {
      query = supabase
        .from("posts")
        .select("*")
        .eq("category", activeCategory)
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);
    }

    const { data } = await query;

    if (data && data.length > 0) {
      setPosts((prev) => {
        const existingIds = new Set(prev.map(p => p.id));
        const newPosts = data.filter(p => !existingIds.has(p.id));
        return [...prev, ...newPosts];
      });
      setOffset((prev) => prev + PAGE_SIZE);
    }

    setIsLoadingMore(false);
  }, [supabase, offset, activeCategory, isLoadingMore, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoadingMore]);

  return (
    <MainLayout profile={profile}>
      <ContentHeader showSearch={true} />

      <div className="px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Life & Daily
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-xl">
            일상 속 작은 발견들. 맛있는 음식과 손으로 그린 그림들을 기록합니다.
          </p>
        </div>

        <div className="mb-8">
          <Stack direction="row" gap="sm" wrap>
            <button
              onClick={() => handleCategoryChange("all")}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${
                  activeCategory === "all"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }
              `}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => handleCategoryChange("food")}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${
                  activeCategory === "food"
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }
              `}
            >
              <span className="mr-1">🍴</span> Food
            </button>
            <button
              onClick={() => handleCategoryChange("drawing")}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${
                  activeCategory === "drawing"
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }
              `}
            >
              <span className="mr-1">🎨</span> Drawing
            </button>
          </Stack>
        </div>

        {isInitialLoading && posts.length === 0 ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            <Grid cols={1} colsMd={2} colsLg={3} gap="lg">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} variant="featured" />
              ))}
            </Grid>

            {posts.length === 0 && (
              <div className="text-center py-16">
                <Icon name="bookmark" size="xl" className="text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-500 dark:text-zinc-400">
                  아직 등록된 게시글이 없습니다.
                </p>
              </div>
            )}

            {posts.length > 0 && (
              <div ref={loaderRef} className="flex justify-center items-center py-8 mt-4">
                {isLoadingMore ? (
                  <div className="flex items-center gap-2 text-zinc-400">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                    <span className="text-sm">불러오는 중...</span>
                  </div>
                ) : hasMore ? (
                  <div className="h-8" />
                ) : (
                  <p className="text-zinc-400 dark:text-zinc-500 text-sm">
                    모든 게시글을 불러왔습니다.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}

function LifePageFallback() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
}

export default function LifePage() {
  return (
    <Suspense fallback={<LifePageFallback />}>
      <LifePageContent />
    </Suspense>
  );
}
