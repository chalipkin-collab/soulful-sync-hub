import { Calendar, CheckSquare, Users, Sparkles, BarChart3 } from "lucide-react";

type Tab = "calendar" | "tasks" | "soldiers" | "ai" | "stats";

interface BottomNavProps {
  active: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: typeof Calendar }[] = [
  { id: "stats", label: "שבצ״ק", icon: BarChart3 },
  { id: "ai", label: "AI", icon: Sparkles },
  { id: "soldiers", label: "חיילים", icon: Users },
  { id: "tasks", label: "משימות", icon: CheckSquare },
  { id: "calendar", label: "לוח שנה", icon: Calendar },
];

export default function BottomNav({ active, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-200 min-w-[56px] ${
              active === id
                ? "text-primary scale-105"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
            {active === id && (
              <div className="w-1 h-1 rounded-full bg-primary animate-pulse-dot" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
