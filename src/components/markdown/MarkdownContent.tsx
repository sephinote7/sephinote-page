import type { ReactNode } from "react";

function renderMarkdownLine(line: string, key: number): ReactNode {
  const trimmed = line.replace(/\r$/, "");

  // Image: allow spaces and parentheses in URL
  const imageMatch = trimmed.match(/^\s*!\[[^\]]*\]\((https?:\/\/.+)\)\s*$/i);
  if (imageMatch) {
    const url = imageMatch[1].trim();
    return (
      <div key={key} className="my-6">
        <img
          src={url}
          alt=""
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800"
          loading="lazy"
        />
      </div>
    );
  }

  if (trimmed.startsWith("## ")) {
    return (
      <h2
        key={key}
        className="text-2xl font-bold mt-8 mb-4 text-zinc-900 dark:text-zinc-100"
      >
        {trimmed.replace("## ", "")}
      </h2>
    );
  }

  if (trimmed.startsWith("### ")) {
    return (
      <h3
        key={key}
        className="text-xl font-semibold mt-6 mb-3 text-zinc-900 dark:text-zinc-100"
      >
        {trimmed.replace("### ", "")}
      </h3>
    );
  }

  if (trimmed.startsWith("- **")) {
    const match = trimmed.match(/- \*\*(.+?)\*\*: (.+)/);
    if (match) {
      return (
        <li key={key} className="ml-4 mb-2 text-zinc-600 dark:text-zinc-400">
          <strong className="text-zinc-900 dark:text-zinc-100">
            {match[1]}
          </strong>
          : {match[2]}
        </li>
      );
    }
  }

  if (trimmed.startsWith("- ")) {
    return (
      <li key={key} className="ml-4 mb-2 text-zinc-600 dark:text-zinc-400">
        {trimmed.replace("- ", "")}
      </li>
    );
  }

  if (trimmed.match(/^\d+\. \*\*/)) {
    const match = trimmed.match(/^\d+\. \*\*(.+?)\*\*: (.+)/);
    if (match) {
      return (
        <li
          key={key}
          className="ml-4 mb-2 list-decimal text-zinc-600 dark:text-zinc-400"
        >
          <strong className="text-zinc-900 dark:text-zinc-100">
            {match[1]}
          </strong>
          : {match[2]}
        </li>
      );
    }
  }

  if (trimmed.match(/^\d+\. /)) {
    return (
      <li
        key={key}
        className="ml-4 mb-2 list-decimal text-zinc-600 dark:text-zinc-400"
      >
        {trimmed.replace(/^\d+\. /, "")}
      </li>
    );
  }

  if (trimmed.trim()) {
    // inline bold **text**
    const parts: ReactNode[] = [];
    const regex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(trimmed)) !== null) {
      if (m.index > lastIndex) {
        parts.push(trimmed.slice(lastIndex, m.index));
      }
      parts.push(
        <strong key={`${key}-b-${m.index}`} className="text-zinc-900 dark:text-zinc-100">
          {m[1]}
        </strong>,
      );
      lastIndex = m.index + m[0].length;
    }
    if (lastIndex < trimmed.length) {
      parts.push(trimmed.slice(lastIndex));
    }

    return (
      <p key={key} className="mb-4 text-zinc-600 dark:text-zinc-400 leading-relaxed">
        {parts}
      </p>
    );
  }

  return null;
}

export default function MarkdownContent({ content }: { content: string }) {
  return <>{content.split("\n").map((line, idx) => renderMarkdownLine(line, idx))}</>;
}

