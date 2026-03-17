"use client";

import { useMemo, useRef, useState } from "react";
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
  Switch,
  Alert,
} from "@/components/ui";
import MarkdownContent from "@/components/markdown/MarkdownContent";
import type { Post } from "@/types";

interface PostEditFormProps {
  initialPost: Post;
}

export default function PostEditForm({ initialPost }: PostEditFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [title, setTitle] = useState(initialPost.title);
  const [content, setContent] = useState(initialPost.content);
  const [category, setCategory] = useState<Post["category"]>(initialPost.category);
  const [locationName, setLocationName] = useState(initialPost.location_name || "");
  const [includeLocation, setIncludeLocation] = useState(!!initialPost.location_name);
  const [imageUrls, setImageUrls] = useState<string[]>(
    (initialPost.image_urls as string[]) || []
  );
  const [thumbnailUrls, setThumbnailUrls] = useState<string[]>(
    (initialPost.thumbnail_urls as string[]) || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAction, setSubmitAction] = useState<"save" | "delete" | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const imageBucket = "post-images";
  const isBusy = isSubmitting;

  const insertMarkdownAtCursor = (text: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const next = content.slice(0, start) + text + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + text.length;
      el.setSelectionRange(cursor, cursor);
    });
  };

  const handleUploadImages = async (files: FileList | null) => {
    if (isBusy) return;
    if (!files || files.length === 0) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("로그인이 필요합니다.");
      router.replace("/admin/login");
      return;
    }

    for (const file of Array.from(files)) {
      const safeName = file.name.replace(/\s+/g, "-");
      const path = `posts/${user.id}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from(imageBucket)
        .upload(path, file, { upsert: false });

      if (uploadError) {
        console.error(uploadError);
        alert(
          `이미지 업로드 실패: ${file.name}\n(스토리지 버킷 "${imageBucket}" 설정을 확인해주세요.)`
        );
        continue;
      }

      const { data } = supabase.storage.from(imageBucket).getPublicUrl(path);
      const url = data.publicUrl;

      setImageUrls((prev) => [...prev, url]);
      setThumbnailUrls((prev) => (prev.length > 0 ? prev : [url]));

      insertMarkdownAtCursor(`\n\n![](${url})\n\n`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBusy) return;
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setSubmitAction("save");

    const { error } = await supabase
      .from("posts")
      .update({
        title: title.trim(),
        content,
        category,
        location_name: includeLocation ? locationName.trim() || null : null,
        image_urls: imageUrls,
        thumbnail_urls: thumbnailUrls,
      })
      .eq("id", initialPost.id)
      .eq("del_yn", "N");

    setIsSubmitting(false);
    setSubmitAction(null);

    if (error) {
      console.error(error);
      alert("게시글 수정 중 오류가 발생했습니다.");
      return;
    }

    alert("게시글이 수정되었습니다!");
    router.push(`/posts/${initialPost.id}`);
  };

  const handleDelete = async () => {
    if (isBusy) return;
    setIsSubmitting(true);
    setSubmitAction("delete");

    const { error } = await supabase
      .from("posts")
      .update({ del_yn: "Y" })
      .eq("id", initialPost.id);

    setIsSubmitting(false);
    setSubmitAction(null);

    if (error) {
      console.error(error);
      alert("게시글 삭제 중 오류가 발생했습니다.");
      return;
    }

    alert("게시글이 삭제되었습니다.");
    router.push("/admin");
  };

  return (
    <div className="max-w-5xl mx-auto w-full">
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
              disabled={isBusy}
            >
              Delete
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isBusy || !title.trim() || !content.trim()}
              leftIcon={<Icon name="check" size="sm" />}
              isLoading={isSubmitting}
            >
              {submitAction === "save" ? "Saving..." : "Save Changes"}
            </Button>
          </Stack>
        </Stack>
      </div>

      {isBusy && (
        <Alert
          variant="info"
          className="mb-6"
          title={submitAction === "delete" ? "삭제 처리 중..." : "저장 중..."}
          description="작업이 끝날 때까지 추가 입력을 잠시만 기다려주세요."
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <Alert
          variant="danger"
          className="mb-6"
          title="게시글을 삭제하시겠습니까?"
          description="이 작업은 되돌릴 수 없습니다. 모든 댓글도 함께 숨겨집니다."
        >
          <Stack direction="row" gap="sm" className="mt-4">
            <Button variant="danger" size="sm" onClick={handleDelete} disabled={isBusy}>
              삭제
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isBusy}
            >
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
                  disabled={isBusy}
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
                  ref={textareaRef}
                  disabled={isBusy}
                />
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardContent>
                <Label className="mb-2">Images</Label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleUploadImages(e.target.files)}
                  disabled={isBusy}
                  className="block w-full text-sm text-zinc-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 dark:text-zinc-300 dark:file:bg-zinc-800 dark:file:text-zinc-200 dark:hover:file:bg-zinc-700"
                />
                <p className="text-xs text-zinc-400 mt-2">
                  업로드한 이미지는 현재 커서 위치에 마크다운으로 삽입됩니다.
                </p>
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
                  onChange={(e) => setCategory(e.target.value as Post["category"])}
                  disabled={isBusy}
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
                    disabled={isBusy}
                  />
                </Stack>
                {includeLocation && (
                  <div className="space-y-3">
                    <Input
                      placeholder="장소 이름"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      disabled={isBusy}
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

          {/* Preview (모바일: 가장 아래, 데스크탑: 왼쪽 컬럼 아래) */}
          <div className="lg:col-span-2 lg:col-start-1 order-last">
            <Card>
              <CardContent>
                <Label className="mb-2">Preview</Label>
                <div className="prose prose-zinc dark:prose-invert max-w-none">
                  <MarkdownContent content={content} />
                </div>
              </CardContent>
            </Card>
          </div>
        </Grid>
      </form>
    </div>
  );
}

