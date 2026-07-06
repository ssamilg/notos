"use client";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
};

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  ariaLabel = "Search",
}: SearchInputProps) {
  return (
    <input
      type="search"
      className="input-bare text-body mb-6 w-full border-b border-white/15 pb-2"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      tabIndex={0}
    />
  );
}
