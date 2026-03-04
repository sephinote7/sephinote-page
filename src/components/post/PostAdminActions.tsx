"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Stack, Button, Icon } from "@/components/ui";

interface PostAdminActionsProps {
  postId: string;
}

export default function PostAdminActions({ postId }: PostAdminActionsProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    router.push(`/admin/edit/${postId}`);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "이 게시글을 삭제하시겠습니까?\n관련 댓글도 함께 삭제될 수 있습니다."
    );
    if (!confirmed) return;

    setIsDeleting(true);

    const { error } = await supabase
      .from("posts")
      .update({ del_yn: "Y" })
      .eq("id", postId);

    if (error) {
      console.error(error);
      alert("게시글 삭제 중 오류가 발생했습니다.");
      setIsDeleting(false);
      return;
    }

    alert("게시글이 삭제되었습니다.");
    router.push("/admin");
  };

  return (
    <Stack direction="row" gap="sm">
      <Button
        variant="outline"
        size="sm"
        onClick={handleEdit}
        leftIcon={<Icon name="settings" size="sm" />}
      >
        수정
      </Button>
      <Button
        variant="danger"
        size="sm"
        onClick={handleDelete}
        isLoading={isDeleting}
        leftIcon={<Icon name="close" size="sm" />}
      >
        삭제
      </Button>
    </Stack>
  );
}

