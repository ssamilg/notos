"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

type TabsProps = {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: ReactNode;
};

function Tabs({ defaultValue = "", value, onValueChange, className, children }: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || "projects");
  const activeValue = value ?? internalValue;

  function setValue(nextValue: string) {
    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue);
  }

  return (
    <TabsContext.Provider value={{ value: activeValue, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

type TabsListProps = {
  className?: string;
  children: ReactNode;
};

function TabsList({ className, children }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn("mb-6 inline-flex gap-1 rounded-lg border border-border p-1", className)}
    >
      {children}
    </div>
  );
}

type TabsTriggerProps = {
  value: string;
  className?: string;
  children: ReactNode;
};

function TabsTrigger({ value, className, children }: TabsTriggerProps) {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error("TabsTrigger must be used within Tabs");
  }

  const isActive = context.value === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      className={cn(
        "rounded-md px-4 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
      onClick={() => context.setValue(value)}
    >
      {children}
    </button>
  );
}

type TabsContentProps = {
  value: string;
  className?: string;
  children: ReactNode;
};

function TabsContent({ value, className, children }: TabsContentProps) {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error("TabsContent must be used within Tabs");
  }

  if (context.value !== value) {
    return null;
  }

  return (
    <div role="tabpanel" className={className}>
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
