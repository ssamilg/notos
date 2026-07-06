"use client";

import { cn } from "@/lib/utils";

type DashboardTab = "projects" | "tags";

type DashboardTabHeaderProps = {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  action?: React.ReactNode;
};

export function DashboardTabHeader({ activeTab, onTabChange, action }: DashboardTabHeaderProps) {
  const tabs: Array<{ id: DashboardTab; label: string }> = [
    { id: "projects", label: "Projects" },
    { id: "tags", label: "Tags" },
  ];

  return (
    <div className="list-header">
      <div className="flex items-end gap-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              className={cn(
                "text-heading cursor-pointer transition-colors",
                isActive
                  ? "glow-text text-foreground"
                  : "text-muted-foreground/50 hover:text-muted-foreground/90"
              )}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onTabChange(tab.id)}
              tabIndex={0}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {action ?? null}
    </div>
  );
}
