import { Calendar, CheckSquare, Users, Sparkles, BarChart3, TableProperties } from "lucide-react";
import type { CustomTab } from "@/lib/customTabsStore";

interface BottomNavProps {
  active: string;
  onTabChange: (tab: string) => void;
  customTabs?: CustomTab[];
}

const builtinTabs: { id: string; label: string; icon: typeof Calendar }[] = [
  { id: "stats", label: "שבצ״ק", icon: BarChart3 },
  { id: "ai", label: "AI", icon: Sparkles },
  { id: "soldiers", label: "חיילים", icon: Users },
  { id: "tasks", label: "משימות", icon: CheckSquare },
  { id: "calendar", label: "לוח שנה", icon: Calendar },
];

export default function BottomNav({ active, onTabChange, customTabs = [] }: BottomNavProps) {
  const allTabs = [
    ...customTabs.map(t => ({ id: t.id, label: t.name, icon: TableProperties })),
    ...builtinTabs,
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-1 overflow-x-auto">
        {allTabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all duration-200 min-w-[48px] flex-shrink-0 ${
              active === id
                ? "text-primary scale-105"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium truncate max-w-[56px]">{label}</span>
            {active === id && (
              <div className="w-1 h-1 rounded-full bg-primary animate-pulse-dot" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
