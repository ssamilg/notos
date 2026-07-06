"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AlertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Close dialog"
        tabIndex={-1}
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-lg">
        {children}
      </div>
    </div>
  );
}

type AlertDialogContentProps = {
  className?: string;
  children: ReactNode;
};

function AlertDialogContent({ className, children }: AlertDialogContentProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div ref={ref} tabIndex={-1} className={cn("outline-none", className)}>
      {children}
    </div>
  );
}

type AlertDialogHeaderProps = {
  children: ReactNode;
};

function AlertDialogHeader({ children }: AlertDialogHeaderProps) {
  return <div className="mb-4 space-y-2">{children}</div>;
}

type AlertDialogTitleProps = {
  children: ReactNode;
};

function AlertDialogTitle({ children }: AlertDialogTitleProps) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}

type AlertDialogDescriptionProps = {
  children: ReactNode;
};

function AlertDialogDescription({ children }: AlertDialogDescriptionProps) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

type AlertDialogFooterProps = {
  children: ReactNode;
};

function AlertDialogFooter({ children }: AlertDialogFooterProps) {
  return <div className="mt-6 flex justify-end gap-2">{children}</div>;
}

type AlertDialogCancelProps = {
  children: ReactNode;
  onClick?: () => void;
};

function AlertDialogCancel({ children, onClick }: AlertDialogCancelProps) {
  return (
    <Button type="button" variant="outline" onClick={onClick}>
      {children}
    </Button>
  );
}

type AlertDialogActionProps = {
  children: ReactNode;
  onClick?: () => void;
};

function AlertDialogAction({ children, onClick }: AlertDialogActionProps) {
  return (
    <Button type="button" variant="destructive" onClick={onClick}>
      {children}
    </Button>
  );
}

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
};
