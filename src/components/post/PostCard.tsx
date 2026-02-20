import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, Badge, Stack, Icon } from "@/components/ui";
import type { Post } from "@/types";

interface PostCardProps {
  post: Post;
  variant?: "default" | "featured";
}

const categoryLabels: Record<Post["category"], string> = {
  portfolio: "Portfolio",
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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PostCard({ post, variant = "default" }: PostCardProps) {
  const readTime = calculateReadTime(post.content);
  const thumbnailUrl = post.thumbnail_urls?.[0] || post.image_urls?.[0];

  if (variant === "featured") {
    return (
      <Link href={`/posts/${post.id}`}>
        <Card
          variant="bordered"
          padding="none"
          className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full"
        >
          <div className="relative aspect-16/10 overflow-hidden bg-linear-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30">
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-16 rounded-lg bg-white/50 dark:bg-zinc-800/50 shadow-lg flex items-center justify-center">
                  <Icon name="bookmark" size="lg" className="text-zinc-400 dark:text-zinc-500" />
                </div>
              </div>
            )}
          </div>
          <CardContent className="p-6">
            <Stack gap="sm">
              <Stack direction="row" gap="sm" align="center">
                <Badge variant={categoryColors[post.category]} size="sm">
                  {categoryLabels[post.category]}
                </Badge>
                <span className="text-xs text-zinc-500">{readTime}</span>
              </Stack>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                {post.content.substring(0, 150)}...
              </p>
              <Stack direction="row" gap="md" align="center" className="mt-2">
                <Stack direction="row" gap="xs" align="center">
                  <Icon name="calendar" size="xs" className="text-zinc-400" />
                  <span className="text-xs text-zinc-500">{formatDate(post.created_at)}</span>
                </Stack>
                <Stack direction="row" gap="xs" align="center">
                  <Icon name="eye" size="xs" className="text-zinc-400" />
                  <span className="text-xs text-zinc-500">{post.view_count || 0}</span>
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/posts/${post.id}`}>
      <Card
        variant="bordered"
        padding="none"
        className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full"
      >
        <div className="relative aspect-4/3 overflow-hidden bg-linear-to-br from-zinc-100 via-zinc-50 to-zinc-200 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-900">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-12 rounded-md bg-white/50 dark:bg-zinc-800/50 shadow flex items-center justify-center">
                <Icon name="bookmark" size="md" className="text-zinc-400 dark:text-zinc-500" />
              </div>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <Stack gap="xs">
            <Stack direction="row" gap="sm" align="center">
              <Badge variant={categoryColors[post.category]} size="sm">
                {categoryLabels[post.category]}
              </Badge>
              <span className="text-xs text-zinc-500">{readTime}</span>
            </Stack>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
              {post.title}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
              {post.content.substring(0, 100)}...
            </p>
          </Stack>
        </CardContent>
      </Card>
    </Link>
  );
}
