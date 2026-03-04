"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
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
import type { Post } from "@/types";

interface PostEditFormProps {
  initialPost: Post;
}

export default function PostEditForm({ initialPost }: PostEditFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState(initialPost.title);
  const [content, setContent] = useState(initialPost.content);
  const [category, setCategory] = useState(initialPost.category);
  const [locationName, setLocationName] = useState(initialPost.location_name || "");
  const [includeLocation, setIncludeLocation] = useState(!!initialPost.location_name);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);

    const { error } = await supabase
      .from("posts")
      .update({
        title: title.trim(),
        content,
        category,
        location_name: includeLocation ? locationName.trim() || null : null,
      })
      .eq("id", initialPost.id)
      .eq("del_yn", "N");

    setIsSubmitting(false);

    if (error) {
      console.error(error);
      alert("게시글 수정 중 오류가 발생했습니다.");
      return;
    }

    alert("게시글이 수정되었습니다!");
    router.push("/admin");
  };

  const handleDelete = async () => {
    setIsSubmitting(true);

    const { error } = await supabase
      .from("posts")
      .update({ del_yn: "Y" })
      .eq("id", initialPost.id);

    setIsSubmitting(false);

    if (error) {
      console.error(error);
      alert("게시글 삭제 중 오류가 발생했습니다.");
      return;
    }

    alert("게시글이 삭제되었습니다.");
    router.push("/admin");
  };

  return (
    <div className="max-w-5xl">
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
              isLoading={isSubmitting}
            >
              Save Changes
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
          description="이 작업은 되돌릴 수 없습니다. 모든 댓글도 함께 숨겨집니다."
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

            {/* Images (UI만 유지, 실제 업로드 로직은 추후 구현) */}
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
                    <span>{new Date(initialPost.created_at).toLocaleDateString("ko-KR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Post ID:</span>
                    <span className="font-mono text-xs">{initialPost.id}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Grid>
      </form>
    </div>
  );
}

