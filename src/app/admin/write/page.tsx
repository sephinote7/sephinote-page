"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
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
  Switch,
} from "@/components/ui";
import type { Post, Profile } from "@/types";

function getProfile(): Profile {
  return {
    id: "demo-user",
    avatar_url: null,
    username: "Sephinote",
    bio: "디지털 디자이너 & 개발자",
  };
}

export default function AdminWritePage() {
  const router = useRouter();
  const profile = getProfile();
  const supabase = useMemo(() => createClient(), []);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Post["category"]>("portfolio");
  const [locationName, setLocationName] = useState("");
  const [includeLocation, setIncludeLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [thumbnailUrls, setThumbnailUrls] = useState<string[]>([]);

  const imageBucket = "post-images";

  useEffect(() => {
    async function guardAndLoadDraft() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      // 최신 draft(미발행) 1개 자동 로드
      const { data: latestDraft } = await supabase
        .from("posts")
        .select("*")
        .eq("author_id", user.id)
        .eq("is_published", false)
        .eq("del_yn", "N")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestDraft) {
        setDraftId(latestDraft.id);
        setTitle(latestDraft.title || "");
        setContent(latestDraft.content || "");
        setCategory((latestDraft.category as Post["category"]) || "portfolio");
        setImageUrls((latestDraft.image_urls as string[]) || []);
        setThumbnailUrls((latestDraft.thumbnail_urls as string[]) || []);
        if (latestDraft.location_name) {
          setLocationName(latestDraft.location_name);
          setIncludeLocation(true);
        }
      }

      setIsLoadingDraft(false);
    }

    guardAndLoadDraft();
  }, [supabase, router]);

  const applyMarkdownAroundSelection = (before: string, after = before) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = content.slice(start, end);
    const next = content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(next);
    // 커서/선택 범위 복원
    requestAnimationFrame(() => {
      el.focus();
      const cursorStart = start + before.length;
      const cursorEnd = cursorStart + selected.length;
      el.setSelectionRange(cursorStart, cursorEnd);
    });
  };

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
        alert(`이미지 업로드 실패: ${file.name}\n(스토리지 버킷 "${imageBucket}" 설정을 확인해주세요.)`);
        continue;
      }

      const { data } = supabase.storage.from(imageBucket).getPublicUrl(path);
      const url = data.publicUrl;

      setImageUrls((prev) => [...prev, url]);
      setThumbnailUrls((prev) => (prev.length > 0 ? prev : [url]));

      // 현재 커서 위치에 마크다운 이미지 삽입
      insertMarkdownAtCursor(`\n\n![](${url})\n\n`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsSubmitting(false);
      router.replace("/admin/login");
      return;
    }

    const payload = {
      author_id: user.id,
      title: title.trim(),
      content,
      category,
      location_name: includeLocation ? locationName.trim() || null : null,
      image_urls: imageUrls,
      thumbnail_urls: thumbnailUrls,
      is_published: true,
      del_yn: "N",
    };

    // draft로 이미 저장된 게 있으면 업데이트, 아니면 insert
    const { data, error } = draftId
      ? await supabase.from("posts").update(payload).eq("id", draftId).select().single()
      : await supabase.from("posts").insert(payload).select().single();

    setIsSubmitting(false);

    if (error || !data) {
      console.error(error);
      alert("게시글 등록 중 오류가 발생했습니다. (RLS/권한/필수 컬럼을 확인해주세요.)");
      return;
    }

    setDraftId(data.id);
    alert("게시글이 등록되었습니다!");
    router.push("/admin");
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsSubmitting(false);
      router.replace("/admin/login");
      return;
    }

    const payload = {
      author_id: user.id,
      title: title.trim() || "(제목 없음)",
      content,
      category,
      location_name: includeLocation ? locationName.trim() || null : null,
      image_urls: imageUrls,
      thumbnail_urls: thumbnailUrls,
      is_published: false,
      del_yn: "N",
    };

    const { data, error } = draftId
      ? await supabase.from("posts").update(payload).eq("id", draftId).select().single()
      : await supabase.from("posts").insert(payload).select().single();

    setIsSubmitting(false);

    if (error || !data) {
      console.error(error);
      alert("임시저장 중 오류가 발생했습니다. (RLS/권한/필수 컬럼을 확인해주세요.)");
      return;
    }

    setDraftId(data.id);
    alert("임시저장되었습니다.");
  };

  return (
    <AdminLayout profile={profile}>
      <div className="p-6 lg:p-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Stack direction="row" justify="between" align="center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                New Post
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400">
                새 게시글을 작성합니다.
              </p>
            </div>
            <Stack direction="row" gap="sm">
              <Button variant="outline" onClick={handleSaveDraft} disabled={isSubmitting || isLoadingDraft}>
                Save Draft
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isSubmitting || isLoadingDraft || !title.trim() || !content.trim()}
                leftIcon={<Icon name="check" size="sm" />}
              >
                {isSubmitting ? "Publishing..." : "Publish"}
              </Button>
            </Stack>
          </Stack>
        </div>

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
                  <Stack direction="row" gap="xs" wrap className="mb-3">
                    <Button variant="outline" size="sm" onClick={() => applyMarkdownAroundSelection("**")} disabled={isSubmitting}>
                      Bold
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => applyMarkdownAroundSelection("*")} disabled={isSubmitting}>
                      Italic
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => insertMarkdownAtCursor("\n## ")} disabled={isSubmitting}>
                      H2
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => insertMarkdownAtCursor("\n### ")} disabled={isSubmitting}>
                      H3
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => insertMarkdownAtCursor("\n- ")} disabled={isSubmitting}>
                      List
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => insertMarkdownAtCursor("\n1. ")} disabled={isSubmitting}>
                      Number
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => applyMarkdownAroundSelection("`")} disabled={isSubmitting}>
                      Code
                    </Button>
                  </Stack>
                  <Textarea
                    id="content"
                    placeholder="게시글 내용을 입력하세요. Markdown 문법을 지원합니다."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={16}
                    className="font-mono"
                    ref={textareaRef}
                  />
                  <p className="text-xs text-zinc-400 mt-2">
                    Markdown 문법을 사용할 수 있습니다. (## 제목, **굵게**, - 목록 등)
                  </p>
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
                      <p className="text-xs text-zinc-400">
                        카카오맵 API 키가 설정되면 지도가 표시됩니다.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent>
                  <Stack direction="row" gap="sm" className="mb-2">
                    <Icon name="info" size="sm" className="text-blue-500" />
                    <span className="font-medium text-blue-700 dark:text-blue-300">
                      작성 팁
                    </span>
                  </Stack>
                  <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                    <li>• 제목은 명확하고 간결하게</li>
                    <li>• 본문에는 적절한 소제목 사용</li>
                    <li>• 이미지는 가로 비율 권장</li>
                    <li>• Food 카테고리는 위치 추가 권장</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </Grid>
        </form>
      </div>
    </AdminLayout>
  );
}
