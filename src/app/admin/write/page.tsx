"use client";

import { useState } from "react";
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
  Divider,
} from "@/components/ui";
import type { Profile } from "@/types";

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

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("portfolio");
  const [locationName, setLocationName] = useState("");
  const [includeLocation, setIncludeLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((r) => setTimeout(r, 1000));

    alert("게시글이 등록되었습니다!");
    router.push("/admin");
  };

  const handleSaveDraft = () => {
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
              <Button variant="outline" onClick={handleSaveDraft}>
                Save Draft
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isSubmitting || !title.trim() || !content.trim()}
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
                  <Textarea
                    id="content"
                    placeholder="게시글 내용을 입력하세요. Markdown 문법을 지원합니다."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={16}
                    className="font-mono"
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
