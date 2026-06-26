type TagLabelProps = {
  name: string;
  className?: string;
};

export function TagLabel({ name, className = "" }: TagLabelProps) {
  return <span className={`text-caption shrink-0 ${className}`.trim()}>[ {name} ]</span>;
}
