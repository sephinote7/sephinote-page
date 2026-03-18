import type { ReactNode } from "react";

function isSafeHttpUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** [label](https://...) — URL에 괄호가 있어도 균형 맞춰 닫는 )까지 인식 */
function extractMarkdownLink(
  line: string,
  from: number,
): { label: string; url: string; end: number } | null {
  if (line[from] !== "[") return null;
  const mid = line.indexOf("](", from);
  if (mid === -1) return null;
  const label = line.slice(from + 1, mid);
  let j = mid + 2;
  while (j < line.length && line[j] === " ") j++;
  const rest = line.slice(j);
  if (!/^https?:\/\//i.test(rest)) return null;
  const startUrl = j;
  let depth = 0;
  while (j < line.length) {
    const ch = line[j];
    if (ch === "(") depth++;
    else if (ch === ")") {
      if (depth === 0) {
        return {
          label,
          url: line.slice(startUrl, j).trim(),
          end: j + 1,
        };
      }
      depth--;
    }
    j++;
  }
  return null;
}

const URL_IN_TEXT =
  /https?:\/\/[^\s\]<>"'`]+(?:\([^\s\])]*\)[^\s\]<>"'`]*)*/gi;

function autolinkPlainUrls(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  const re = new RegExp(URL_IN_TEXT.source, "gi");
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      nodes.push(text.slice(last, m.index));
    }
    const raw = m[0];
    let url = raw.replace(/[.,;:!?)]+$/, "");
    const trailing = raw.slice(url.length);
    if (isSafeHttpUrl(url)) {
      nodes.push(
        <a
          key={`${keyPrefix}-url-${m.index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline decoration-blue-600/60 hover:opacity-80 dark:text-blue-400 dark:decoration-blue-400/60 break-all"
        >
          {url}
        </a>,
      );
    } else {
      nodes.push(raw);
    }
    if (trailing) nodes.push(trailing);
    last = m.index + raw.length;
  }
  if (last < text.length) {
    nodes.push(text.slice(last));
  }
  return nodes.length ? nodes : [text];
}

function renderBoldInText(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  let idx = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIndex) {
      parts.push(
        ...autolinkPlainUrls(text.slice(lastIndex, m.index), `${keyPrefix}-b-${idx++}`),
      );
    }
    parts.push(
      <strong
        key={`${keyPrefix}-s-${m.index}`}
        className="text-zinc-900 dark:text-zinc-100"
      >
        {m[1]}
      </strong>,
    );
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(...autolinkPlainUrls(text.slice(lastIndex), `${keyPrefix}-tail`));
  }
  return parts.length ? parts : autolinkPlainUrls(text, keyPrefix);
}

/** 링크 → 굵게 → 노출 URL 순으로 인라인 렌더 */
function renderInline(line: string, keyPrefix: string): ReactNode {
  const parts: ReactNode[] = [];
  let i = 0;
  let k = 0;
  while (i < line.length) {
    if (line[i] === "[") {
      const link = extractMarkdownLink(line, i);
      if (link && link.url && isSafeHttpUrl(link.url)) {
        parts.push(
          <a
            key={`${keyPrefix}-l-${k++}`}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline decoration-blue-600/60 hover:opacity-80 dark:text-blue-400 dark:decoration-blue-400/60 break-all"
          >
            {link.label || link.url}
          </a>,
        );
        i = link.end;
        continue;
      }
      if (link && link.url && !isSafeHttpUrl(link.url)) {
        parts.push(line.slice(i, link.end));
        i = link.end;
        continue;
      }
      parts.push("[");
      i += 1;
      continue;
    }
    const nextBracket = line.indexOf("[", i);
    const end = nextBracket === -1 ? line.length : nextBracket;
    const chunk = line.slice(i, end);
    parts.push(...renderBoldInText(chunk, `${keyPrefix}-c-${k++}`));
    i = end;
  }
  if (parts.length === 0) return null;
  if (parts.length === 1) return parts[0];
  return <>{parts}</>;
}

function renderMarkdownLine(line: string, key: number): ReactNode {
  const trimmed = line.replace(/\r$/, "");

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
    const body = trimmed.slice(3);
    return (
      <h2
        key={key}
        className="text-2xl font-bold mt-8 mb-4 text-zinc-900 dark:text-zinc-100"
      >
        {renderInline(body, `h2-${key}`)}
      </h2>
    );
  }

  if (trimmed.startsWith("### ")) {
    const body = trimmed.slice(4);
    return (
      <h3
        key={key}
        className="text-xl font-semibold mt-6 mb-3 text-zinc-900 dark:text-zinc-100"
      >
        {renderInline(body, `h3-${key}`)}
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
          : {renderInline(match[2], `li-${key}`)}
        </li>
      );
    }
  }

  if (trimmed.startsWith("- ")) {
    const body = trimmed.slice(2);
    return (
      <li key={key} className="ml-4 mb-2 text-zinc-600 dark:text-zinc-400">
        {renderInline(body, `li-${key}`)}
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
          : {renderInline(match[2], `oli-${key}`)}
        </li>
      );
    }
  }

  if (trimmed.match(/^\d+\. /)) {
    const body = trimmed.replace(/^\d+\. /, "");
    return (
      <li
        key={key}
        className="ml-4 mb-2 list-decimal text-zinc-600 dark:text-zinc-400"
      >
        {renderInline(body, `oli-${key}`)}
      </li>
    );
  }

  if (trimmed.trim()) {
    return (
      <p key={key} className="mb-4 text-zinc-600 dark:text-zinc-400 leading-relaxed">
        {renderInline(trimmed, `p-${key}`)}
      </p>
    );
  }

  return null;
}

export default function MarkdownContent({ content }: { content: string }) {
  return <>{content.split("\n").map((line, idx) => renderMarkdownLine(line, idx))}</>;
}
