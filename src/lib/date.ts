export function formatRelativeTimeFromNow(isoDateString: string): string {
  if (!isoDateString) return "";

  const createdAt = new Date(isoDateString);
  const now = new Date();

  // 잘못된 날짜이거나 미래 시각이면 방금 처리
  if (isNaN(createdAt.getTime()) || createdAt > now) {
    return "방금";
  }

  const diffMs = now.getTime() - createdAt.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "방금";
  if (diffMinutes < 5) return "5분 전";
  if (diffMinutes < 10) return "10분 전";
  if (diffMinutes < 30) return "30분 전";

  if (diffHours < 1) return "1시간 전";
  if (diffHours < 3) return "3시간 전";
  if (diffHours < 6) return "6시간 전";
  if (diffHours < 12) return "12시간 전";

  if (diffDays < 1) return "하루 전";
  if (diffDays < 3) return "3일 전";

  const year = createdAt.getFullYear();
  const month = String(createdAt.getMonth() + 1).padStart(2, "0");
  const day = String(createdAt.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

