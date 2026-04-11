import { useState } from "react";
import { Calendar, CheckSquare, Users, Sparkles, BarChart3, TableProperties, Pencil, Check } from "lucide-react";
import { useEditMode } from "@/lib/EditModeContext";
import type { CustomTab } from "@/lib/customTabsStore";
import { Input } from "@/components/ui/input";

interface BottomNavProps {
  active: string;
  onTabChange: (tab: string) => void;
  customTabs?: CustomTab[];
  onRenameTab?: (id: string, newName: string) => void;
}

const builtinTabs: { id: string; label: string; icon: typeof Calendar }[] = [
  { id: "stats", label: "סיכום", icon: BarChart3 },
  { id: "ai", label: "AI", icon: Sparkles },
  { id: "soldiers", label: "חיילים", icon: Users },
  { id: "tasks", label: "משימות", icon: CheckSquare },
  { id: "calendar", label: "לוח שנה", icon: Calendar },
];

export default function BottomNav({ active, onTabChange, customTabs = [], onRenameTab }: BottomNavProps) {
  const { isEditMode } = useEditMode();
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const allTabs = [
    ...customTabs.map(t => ({ id: t.id, label: t.name, icon: TableProperties, isCustom: true })),
    ...builtinTabs.map(t => ({ ...t, isCustom: false })),
  ];

  const startRename = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTabId(id);
    setEditName(name);
  };

  const commitRename = () => {
    if (editingTabId && editName.trim() && onRenameTab) {
      onRenameTab(editingTabId, editName.trim());
    }
    setEditingTabId(null);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border">
      <div className="flex items-center h-16 max-w-lg mx-auto px-1 overflow-x-auto scrollbar-hide">
        {allTabs.map(({ id, label, icon: Icon, isCustom }) => (
          <button
            key={id}
            onClick={() => editingTabId !== id && onTabChange(id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-200 min-w-[64px] flex-shrink-0 ${
              active === id
                ? "text-primary scale-105"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {isEditMode && isCustom && editingTabId !== id && (
                <button
                  onClick={(e) => startRename(id, label, e)}
                  className="absolute -top-1 -right-3 bg-primary text-primary-foreground rounded-full p-0.5"
                >
                  <Pencil className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
            {editingTabId === id ? (
              <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                <Input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && commitRename()}
                  onBlur={commitRename}
                  className="h-5 text-[9px] w-16 px-1 py-0"
                  autoFocus
                />
              </div>
            ) : (
              <span className="text-[10px] font-medium truncate max-w-[56px]">{label}</span>
            )}
            {active === id && !editingTabId && (
              <div className="w-1 h-1 rounded-full bg-primary animate-pulse-dot" />
            )}
          </button>
        ))}
      </div>
      {/* Spacer to push Lovable badge below tabs */}
      <div className="h-2 safe-area-bottom" />
    </nav>
  );
}
