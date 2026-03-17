export function extractFirstMarkdownImageUrl(markdown: string): string | null {
  if (!markdown) return null;
  const match = markdown.match(/!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/i);
  return match?.[1] ?? null;
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

