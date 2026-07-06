type LiveStatusProps = {
  message: string;
};

export function LiveStatus({ message }: LiveStatusProps) {
  return (
    <p role="status" aria-live="polite" aria-atomic="true" className="text-sm text-muted-foreground">
      {message}
    </p>
  );
}
