"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";

type MarkdownContentProps = {
  content: string;
};

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-heading glow-text mb-4 mt-8 first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-display mb-3 mt-6 first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-3 mt-5 text-2xl first:mt-0">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-2 mt-4 text-xl first:mt-0">{children}</h4>
  ),
  p: ({ children }) => <p className="text-body mb-4 last:mb-0">{children}</p>,
  ul: ({ children }) => (
    <ul className="text-body my-4 list-disc space-y-2 pl-6">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="text-body my-4 list-decimal space-y-2 pl-6">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="text-body my-4 border-l-2 border-white/30 pl-4 italic">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded-sm bg-white/10 px-1.5 py-0.5 font-mono text-base">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="text-body my-4 overflow-x-auto rounded-sm bg-white/5 p-4 font-mono text-base">
      {children}
    </pre>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-foreground underline underline-offset-4 hover:text-white/80"
      rel="noreferrer"
      target="_blank"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-6 border-white/15" />,
};

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="max-w-3xl">
      <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
    </div>
  );
}
