export function stripMarkdown(text: string): string {
  let plain = text;

  plain = plain.replace(/```[\s\S]*?```/g, " ");
  plain = plain.replace(/`([^`]+)`/g, "$1");
  plain = plain.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1");
  plain = plain.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
  plain = plain.replace(/^#{1,6}\s+/gm, "");
  plain = plain.replace(/^>\s+/gm, "");
  plain = plain.replace(/^[\-*+]\s+/gm, "");
  plain = plain.replace(/^\d+\.\s+/gm, "");
  plain = plain.replace(/\*\*([^*]+)\*\*/g, "$1");
  plain = plain.replace(/\*([^*]+)\*/g, "$1");
  plain = plain.replace(/__([^_]+)__/g, "$1");
  plain = plain.replace(/_([^_]+)_/g, "$1");
  plain = plain.replace(/~~([^~]+)~~/g, "$1");
  plain = plain.replace(/^---+$/gm, " ");
  plain = plain.replace(/\n+/g, " ");
  plain = plain.replace(/\s+/g, " ").trim();

  return plain;
}
