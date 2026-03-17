export function extractFirstMarkdownImageUrl(markdown: string): string | null {
  if (!markdown) return null;
  // 파일명에 ')'가 포함될 수 있어, 라인 기준으로 가장 마지막 ')'를 닫는 것으로 처리
  const match = markdown.match(/!\[[^\]]*\]\((https?:\/\/.+?)\)\s*$/im);
  if (match?.[1]) return match[1].trim();

  // 라인 끝이 아닌 경우(문장 중간)도 보완
  const matchInline = markdown.match(/!\[[^\]]*\]\((https?:\/\/.+?)\)/i);
  return matchInline?.[1]?.trim() ?? null;
}

export function stripMarkdown(markdown: string): string {
  if (!markdown) return "";

  return (
    markdown
      // images
      .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
      // links: [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // headings
      .replace(/^#{1,6}\s+/gm, "")
      // bold/italic/code markers
      .replace(/(\*\*|__)(.*?)\1/g, "$2")
      .replace(/(\*|_)(.*?)\1/g, "$2")
      .replace(/`{1,3}([^`]+)`{1,3}/g, "$1")
      // list markers
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/^\s*\d+\.\s+/gm, "")
      // extra whitespace
      .replace(/\n{2,}/g, "\n")
      .trim()
  );
}

