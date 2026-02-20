"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { MainLayout, ContentHeader } from "@/components/layout";
import { PostCard } from "@/components/post";
import { Stack, Grid, Icon, Input, Button } from "@/components/ui";
import type { Post, Profile } from "@/types";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(query);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      // 프로필 로드
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .limit(1)
        .single();
      
      setProfile(profileData);

      // 검색 수행
      if (query) {
        const { data: postsData } = await supabase
          .from("posts")
          .select("*")
          .eq("is_published", true)
          .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
          .order("created_at", { ascending: false });

        setPosts(postsData || []);
      } else {
        setPosts([]);
      }

      setIsLoading(false);
    }

    loadData();
  }, [query, supabase]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  }, [searchInput, router]);

  return (
    <MainLayout profile={profile}>
      <ContentHeader showTabs={false} showSearch={false} />

      <div className="px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Search Results
          </h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-3 max-w-xl items-center">
            <Input
              placeholder="제목 또는 내용으로 검색..."
              leftIcon={<Icon name="search" size="sm" />}
              className="flex-1"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Button type="submit" variant="primary" className="shrink-0 h-10">
              검색
            </Button>
          </form>
        </div>

        {/* Search Query Info */}
        {query && (
          <div className="mb-6">
            <p className="text-zinc-500 dark:text-zinc-400">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">&quot;{query}&quot;</span>
              {" "}검색 결과 {posts.length}건
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            {/* Results Grid */}
            {posts.length > 0 ? (
              <Grid cols={1} colsMd={2} colsLg={3} gap="lg">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} variant="featured" />
                ))}
              </Grid>
            ) : query ? (
              <div className="text-center py-16">
                <Icon name="search" size="xl" className="text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-500 dark:text-zinc-400 mb-2">
                  &quot;{query}&quot;에 대한 검색 결과가 없습니다.
                </p>
                <p className="text-sm text-zinc-400 dark:text-zinc-500">
                  다른 키워드로 검색해보세요.
                </p>
              </div>
            ) : (
              <div className="text-center py-16">
                <Icon name="search" size="xl" className="text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-500 dark:text-zinc-400">
                  검색어를 입력해주세요.
                </p>
              </div>
            )}
          </>
        )}

        {/* Back Button */}
        <Stack align="center" className="mt-12">
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            leftIcon={<Icon name="arrow-left" size="sm" />}
          >
            홈으로 돌아가기
          </Button>
        </Stack>
      </div>
    </MainLayout>
  );
}

function SearchPageFallback() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchPageContent />
    </Suspense>
  );
}
