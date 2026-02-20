"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { PostCard } from "@/components/post";
import { Grid, Icon } from "@/components/ui";
import type { Post } from "@/types";

interface PostGridProps {
  initialPosts: Post[];
  totalCount: number;
  sortBy?: string;
  category?: string;
}

const PAGE_SIZE = 9;

export default function PostGrid({ initialPosts, totalCount, sortBy, category }: PostGridProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState(PAGE_SIZE);
  const loaderRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();
  const hasMore = posts.length < totalCount;

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    let query = supabase
      .from("posts")
      .select("*")
      .eq("is_published", true);

    if (category) {
      query = query.eq("category", category);
    }

    if (sortBy === "popular") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      query = query
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("view_count", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data } = await query
      .range(offset, offset + PAGE_SIZE - 1);

    if (data && data.length > 0) {
      setPosts((prev) => {
        const existingIds = new Set(prev.map(p => p.id));
        const newPosts = data.filter(p => !existingIds.has(p.id));
        return [...prev, ...newPosts];
      });
      setOffset((prev) => prev + PAGE_SIZE);
    }

    setIsLoading(false);
  }, [supabase, offset, sortBy, category, isLoading, hasMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoading]);

  // Reset when sortBy or category changes
  useEffect(() => {
    setPosts(initialPosts);
    setOffset(PAGE_SIZE);
  }, [initialPosts]);

  return (
    <>
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

      {/* Infinite Scroll Loader */}
      {posts.length > 0 && (
        <div ref={loaderRef} className="flex justify-center items-center py-8 mt-4">
          {isLoading ? (
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
  );
}
