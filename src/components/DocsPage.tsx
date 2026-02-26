import { type ReactNode, useEffect } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import syntax from "../../DISPLAY_V2_SYNTAX.md?raw";
import type { Components } from "react-markdown";

function slugify(children: ReactNode): string {
  const text =
    typeof children === "string"
      ? children
      : Array.isArray(children)
        ? children
            .map((c) => (typeof c === "string" ? c : ""))
            .join("")
        : String(children ?? "");
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function Heading({
  level,
  className,
  children,
}: {
  level: 1 | 2 | 3;
  className: string;
  children: ReactNode;
}) {
  const id = slugify(children);
  const Tag = `h${level}` as const;
  return (
    <Tag id={id} className={`group ${className}`}>
      <a
        href={`#${id}`}
        className="no-underline hover:underline"
        onClick={(e) => {
          e.preventDefault();
          history.replaceState(null, "", `#${id}`);
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        {children}
        <span className="ml-2 text-gray-600 opacity-0 transition-opacity group-hover:opacity-100">
          #
        </span>
      </a>
    </Tag>
  );
}

const components: Components = {
  h1: ({ children }) => (
    <Heading level={1} className="mb-4 mt-8 text-2xl font-bold text-white first:mt-0">
      {children}
    </Heading>
  ),
  h2: ({ children }) => (
    <Heading level={2} className="mb-3 mt-8 text-xl font-semibold text-white">
      {children}
    </Heading>
  ),
  h3: ({ children }) => (
    <Heading level={3} className="mb-2 mt-6 text-lg font-semibold text-gray-200">
      {children}
    </Heading>
  ),
  p: ({ children }) => {
    // Skip empty paragraphs that produce blank space
    const isEmpty =
      !children ||
      (Array.isArray(children) &&
        children.every(
          (c) => c == null || (typeof c === "string" && !c.trim()),
        )) ||
      (typeof children === "string" && !children.trim());
    if (isEmpty) return null;
    return (
      <p className="mb-3 leading-relaxed text-gray-300">{children}</p>
    );
  },
  ul: ({ children }) => (
    <ul className="mb-4 list-disc space-y-1 pl-6 text-gray-300">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-decimal space-y-1 pl-6 text-gray-300">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="text-gray-300">{children}</li>,
  code: ({ children }) => (
    <code className="rounded bg-gray-800 px-1.5 py-0.5 font-mono text-sm text-purple-300">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-800 p-4 font-mono text-sm text-gray-200 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit [&_code]:text-[inherit]">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-gray-700 text-left text-gray-400">
      {children}
    </thead>
  ),
  th: ({ children }) => <th className="px-3 py-2 font-medium">{children}</th>,
  td: ({ children }) => (
    <td className="border-t border-gray-800 px-3 py-2 text-gray-300">
      {children}
    </td>
  ),
  hr: () => <hr className="my-6 border-gray-800" />,
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-blue-400 underline hover:text-blue-300"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-4 border-l-2 border-gray-700 pl-4 text-gray-400">
      {children}
    </blockquote>
  ),
};

export function DocsPage() {
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      requestAnimationFrame(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, []);

  return (
    <div className="prose-invert max-w-none">
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {syntax}
      </Markdown>
    </div>
  );
}
