"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Button, Icon } from "@/components/ui";

interface RestoreCommentButtonProps {
  commentId: string;
}

export default function RestoreCommentButton({ commentId }: RestoreCommentButtonProps) {
  const supabase = createClient();
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = async () => {
    const confirmed = window.confirm("이 댓글을 복구하시겠습니까?");
    if (!confirmed) return;

    setIsRestoring(true);

    const { error } = await supabase
      .from("comments")
      .update({ del_yn: "N" })
      .eq("id", commentId);

    setIsRestoring(false);

    if (error) {
      console.error(error);
      alert("댓글 복구 중 오류가 발생했습니다.");
      return;
    }

    alert("댓글이 복구되었습니다.");
    window.location.reload();
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleRestore}
      isLoading={isRestoring}
      aria-label="댓글 복구"
    >
      <Icon name="check" size="sm" />
    </Button>
  );
}

