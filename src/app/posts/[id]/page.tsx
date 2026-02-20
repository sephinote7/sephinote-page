import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { MainLayout } from "@/components/layout";
import { CommentSection, KakaoMap } from "@/components/post";
import { Stack, Badge, Icon, Avatar, Divider } from "@/components/ui";
import type { Post, Profile, Comment } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
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

async function getPost(id: string): Promise<Post | null> {
  const supabase = await createServerSupabaseClient();
  
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .single();
  
  return data;
}

async function incrementViewCount(id: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.rpc("increment_view_count", { post_id: id });
}

async function getComments(postId: string): Promise<Comment[]> {
  const supabase = await createServerSupabaseClient();
  
  const { data } = await supabase
    .from("comments")
    .select("id, post_id, parent_id, content, nickname, is_admin, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  
  return data || [];
}

const categoryLabels: Record<Post["category"], string> = {
  portfolio: "Works",
  food: "Food",
  drawing: "Drawing",
};

const categoryColors: Record<Post["category"], "primary" | "success" | "secondary"> = {
  portfolio: "primary",
  food: "success",
  drawing: "secondary",
};

function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

function renderContent(content: string) {
  return content.split("\n").map((line, idx) => {
    if (line.startsWith("## ")) {
      return (
        <h2 key={idx} className="text-2xl font-bold mt-8 mb-4 text-zinc-900 dark:text-zinc-100">
          {line.replace("## ", "")}
        </h2>
      );
    }
    if (line.startsWith("### ")) {
      return (
        <h3 key={idx} className="text-xl font-semibold mt-6 mb-3 text-zinc-900 dark:text-zinc-100">
          {line.replace("### ", "")}
        </h3>
      );
    }
    if (line.startsWith("- **")) {
      const match = line.match(/- \*\*(.+?)\*\*: (.+)/);
      if (match) {
        return (
          <li key={idx} className="ml-4 mb-2 text-zinc-600 dark:text-zinc-400">
            <strong className="text-zinc-900 dark:text-zinc-100">{match[1]}</strong>: {match[2]}
          </li>
        );
      }
    }
    if (line.startsWith("- ")) {
      return (
        <li key={idx} className="ml-4 mb-2 text-zinc-600 dark:text-zinc-400">
          {line.replace("- ", "")}
        </li>
      );
    }
    if (line.match(/^\d+\. \*\*/)) {
      const match = line.match(/^\d+\. \*\*(.+?)\*\*: (.+)/);
      if (match) {
        return (
          <li key={idx} className="ml-4 mb-2 list-decimal text-zinc-600 dark:text-zinc-400">
            <strong className="text-zinc-900 dark:text-zinc-100">{match[1]}</strong>: {match[2]}
          </li>
        );
      }
    }
    if (line.match(/^\d+\. /)) {
      return (
        <li key={idx} className="ml-4 mb-2 list-decimal text-zinc-600 dark:text-zinc-400">
          {line.replace(/^\d+\. /, "")}
        </li>
      );
    }
    if (line.trim()) {
      return (
        <p key={idx} className="mb-4 text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {line}
        </p>
      );
    }
    return null;
  });
}

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await getProfile();
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  // 조회수 증가
  await incrementViewCount(id);

  const comments = await getComments(id);
  const readTime = calculateReadTime(post.content);

  return (
    <MainLayout profile={profile}>
      <article className="px-6 lg:px-8 py-8 max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-6 transition-colors"
        >
          <Icon name="arrow-left" size="sm" />
          Back to Posts
        </Link>

        {/* Header */}
        <header className="mb-8">
          <Stack direction="row" gap="sm" align="center" className="mb-4">
            <Badge variant={categoryColors[post.category]}>
              {categoryLabels[post.category]}
            </Badge>
            <span className="text-sm text-zinc-500">{readTime}</span>
            <Stack direction="row" gap="xs" align="center">
              <Icon name="eye" size="xs" className="text-zinc-400" />
              <span className="text-sm text-zinc-500">{(post.view_count || 0) + 1}</span>
            </Stack>
          </Stack>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            {post.title}
          </h1>
          <Stack direction="row" gap="md" align="center">
            <Avatar src={profile?.avatar_url || undefined} className="w-10 h-10" />
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                {profile?.username || "Admin"}
              </p>
              <p className="text-sm text-zinc-500">
                {new Date(post.created_at).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </Stack>
        </header>

        {/* Featured Image */}
        {(post.thumbnail_urls?.[0] || post.image_urls?.[0]) && (
          <div className="relative aspect-video rounded-xl overflow-hidden mb-8 bg-zinc-100 dark:bg-zinc-800">
            <Image
              src={post.thumbnail_urls?.[0] || post.image_urls?.[0]}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-zinc dark:prose-invert max-w-none mb-12">
          {renderContent(post.content)}
        </div>

        {/* Map for Food/Drawing posts */}
        {post.lat && post.lng && (
          <div className="mb-12">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              📍 Location
            </h2>
            <KakaoMap
              lat={post.lat}
              lng={post.lng}
              locationName={post.location_name}
              className="border border-zinc-200 dark:border-zinc-800"
            />
          </div>
        )}

        <Divider className="mb-12" />

        {/* Comments */}
        <CommentSection postId={post.id} comments={comments} profile={profile} />
      </article>
    </MainLayout>
  );
}
