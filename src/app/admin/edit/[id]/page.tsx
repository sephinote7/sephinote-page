"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout";
import {
  Card,
  CardContent,
  Stack,
  Grid,
  Button,
  Icon,
  Input,
  Textarea,
  Select,
  Label,
  FileUpload,
  Switch,
  Alert,
} from "@/components/ui";
import type { Profile, Post } from "@/types";

function getProfile(): Profile {
  return {
    id: "demo-user",
    avatar_url: null,
    username: "Sephinote",
    bio: "디지털 디자이너 & 개발자",
  };
}

function getPost(id: string): Post | null {
  const posts: Record<string, Post> = {
    "1": {
      id: "1",
      created_at: new Date().toISOString(),
      title: "The Future of Minimalist Design in 2025",
      content: "How decreasing visual noise leads to increased user retention and cognitive ease in modern web apps.\n\n## 미니멀리즘의 진화\n\n현대 웹 디자인에서 미니멀리즘은 단순히 적은 요소를 사용하는 것을 넘어섰습니다.",
      category: "portfolio",
      image_urls: [],
      thumbnail_urls: [],
      author_id: "demo-user",
    },
    "f1": {
      id: "f1",
      created_at: new Date().toISOString(),
      title: "서촌 골목의 작은 카페",
      content: "오래된 한옥을 개조한 카페에서 발견한 특별한 커피 한 잔.\n\n## 서촌에서 발견한 숨은 보석\n\n시간이 멈춘 듯한 고요함이 있습니다.",
      category: "food",
      image_urls: [],
      thumbnail_urls: [],
      author_id: "demo-user",
      location_name: "서촌 카페",
      lat: 37.5796,
      lng: 126.9705,
    },
  };
  return posts[id] || null;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminEditPage({ params }: PageProps) {
  const router = useRouter();
  const profile = getProfile();
  const [postId, setPostId] = useState<string>("");
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("portfolio");
  const [locationName, setLocationName] = useState("");
  const [includeLocation, setIncludeLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    params.then(({ id }) => {
      setPostId(id);
      const loadedPost = getPost(id);
      if (loadedPost) {
        setPost(loadedPost);
        setTitle(loadedPost.title);
        setContent(loadedPost.content);
        setCategory(loadedPost.category);
        if (loadedPost.location_name) {
          setLocationName(loadedPost.location_name);
          setIncludeLocation(true);
        }
      }
    });
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((r) => setTimeout(r, 1000));

    alert("게시글이 수정되었습니다!");
    router.push("/admin");
  };

  const handleDelete = async () => {
    await new Promise((r) => setTimeout(r, 500));
    alert("게시글이 삭제되었습니다.");
    router.push("/admin");
  };

  if (!post) {
    return (
      <AdminLayout profile={profile}>
        <div className="p-6 lg:p-8 text-center">
          <Icon name="close" size="xl" className="text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            게시글을 찾을 수 없습니다
          </h1>
          <Button variant="primary" onClick={() => router.push("/admin")}>
            대시보드로 돌아가기
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout profile={profile}>
      <div className="p-6 lg:p-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Stack direction="row" justify="between" align="center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Edit Post
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400">
                게시글을 수정합니다.
              </p>
            </div>
            <Stack direction="row" gap="sm">
              <Button
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
                leftIcon={<Icon name="close" size="sm" />}
              >
                Delete
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isSubmitting || !title.trim() || !content.trim()}
                leftIcon={<Icon name="check" size="sm" />}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </Stack>
          </Stack>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <Alert
            variant="danger"
            className="mb-6"
            title="게시글을 삭제하시겠습니까?"
            description="이 작업은 되돌릴 수 없습니다. 모든 댓글도 함께 삭제됩니다."
          >
            <Stack direction="row" gap="sm" className="mt-4">
              <Button variant="danger" size="sm" onClick={handleDelete}>
                삭제
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                취소
              </Button>
            </Stack>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid cols={1} colsLg={3} gap="lg">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <Card>
                <CardContent>
                  <Label htmlFor="title" className="mb-2">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="게시글 제목을 입력하세요"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg"
                  />
                </CardContent>
              </Card>

              {/* Content */}
              <Card>
                <CardContent>
                  <Label htmlFor="content" className="mb-2">
                    Content *
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="게시글 내용을 입력하세요"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={16}
                    className="font-mono"
                  />
                </CardContent>
              </Card>

              {/* Images */}
              <Card>
                <CardContent>
                  <Label className="mb-2">Images</Label>
                  <FileUpload
                    accept="image/*"
                    multiple
                    onChange={(files) => console.log(files)}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Category */}
              <Card>
                <CardContent>
                  <Label htmlFor="category" className="mb-2">
                    Category *
                  </Label>
                  <Select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    options={[
                      { value: "portfolio", label: "Portfolio" },
                      { value: "food", label: "Food" },
                      { value: "drawing", label: "Drawing" },
                    ]}
                  />
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardContent>
                  <Stack direction="row" justify="between" align="center" className="mb-4">
                    <Label>Location</Label>
                    <Switch
                      checked={includeLocation}
                      onChange={(e) => setIncludeLocation(e.target.checked)}
                    />
                  </Stack>
                  {includeLocation && (
                    <div className="space-y-3">
                      <Input
                        placeholder="장소 이름"
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                      />
                      <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                        <Stack align="center" gap="sm" className="text-center">
                          <Icon name="bookmark" size="lg" className="text-zinc-400" />
                          <p className="text-sm text-zinc-500">
                            지도에서 위치를 선택하세요
                          </p>
                        </Stack>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Post Info */}
              <Card className="bg-zinc-50 dark:bg-zinc-800/50">
                <CardContent>
                  <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-3">
                    Post Info
                  </h3>
                  <div className="space-y-2 text-sm text-zinc-500">
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span>{new Date(post.created_at).toLocaleDateString("ko-KR")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Post ID:</span>
                      <span className="font-mono text-xs">{postId}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Grid>
        </form>
      </div>
    </AdminLayout>
  );
}
