"use client";

import ReactMarkdown from "react-markdown";

type MarkdownContentProps = {
  content: string;
};

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="text-body prose prose-invert max-w-3xl">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
